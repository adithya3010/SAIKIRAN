import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { dequeueCheckoutJobs, moveToDeadLetter, setCheckoutJobStatus } from '@/lib/checkoutQueue';
import { sendEmail } from '@/lib/email';
import { generateOrderPlacedEmail } from '@/lib/emailTemplates';

export const runtime = 'nodejs';

function isAuthorized(request) {
  // Vercel Cron jobs include this header; using it avoids putting secrets in the URL.
  // Only trust it when running on Vercel.
  if (process.env.VERCEL && request.headers.get('x-vercel-cron') === '1') {
    return true;
  }

  const secret = process.env.CHECKOUT_WORKER_SECRET;
  if (!secret) return false;

  const url = new URL(request.url);
  const qs = url.searchParams.get('secret');
  if (qs && qs === secret) return true;

  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ') && auth.slice('Bearer '.length) === secret) return true;

  return false;
}

function normalizeItems(orderItems) {
  return (orderItems || []).map((item) => ({
    product: item.product,
    name: item.name,
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
    selectedSize: item.selectedSize,
    selectedColor: item.selectedColor,
    image: item.image,
  }));
}

function buildVariantKey(productId, size, colorName) {
  return `${String(productId)}|${String(size || '')}|${String(colorName || '').toLowerCase()}`;
}

async function processJob(job) {
  const payload = job?.payload;
  if (!payload) {
    return { ok: false, error: 'Missing payload' };
  }

  const userId = payload?.user?.id;
  const userEmail = payload?.user?.email;
  const orderItems = normalizeItems(payload?.orderItems);
  const shippingAddress = payload?.shippingAddress;
  const paymentMethod = payload?.paymentMethod;

  if (!userId) return { ok: false, error: 'Missing user id' };
  if (!Array.isArray(orderItems) || orderItems.length === 0) return { ok: false, error: 'No items' };
  if (!shippingAddress) return { ok: false, error: 'Missing shipping address' };
  if (!paymentMethod) return { ok: false, error: 'Missing payment method' };

  // 1) One read to validate stock for all items.
  const productIds = [...new Set(orderItems.map((i) => i.product).filter(Boolean))];
  if (productIds.length === 0) return { ok: false, error: 'No product ids' };

  const tRead0 = Date.now();
  const products = await Product.find({ _id: { $in: productIds } })
    .select('_id variants')
    .lean();
  const readMs = Date.now() - tRead0;
  if (readMs > 250) {
    console.warn('Slow Mongo query worker products:', { readMs, count: productIds.length });
  }

  const stockByVariant = new Map();
  for (const p of products) {
    const pid = p?._id?.toString?.() || p?._id;
    const variants = Array.isArray(p?.variants) ? p.variants : [];
    for (const v of variants) {
      const size = v?.size;
      const colorName = v?.color?.name;
      const key = buildVariantKey(pid, size, colorName);
      stockByVariant.set(key, Number(v?.stock || 0));
    }
  }

  for (const item of orderItems) {
    const pid = item.product;
    const colorName = item?.selectedColor?.name || item?.selectedColor;
    const key = buildVariantKey(pid, item.selectedSize, colorName);
    const available = stockByVariant.get(key);

    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      return { ok: false, error: `Invalid quantity for ${item.name || pid}` };
    }
    if (available == null) {
      return { ok: false, error: `Variant not found for ${item.name || pid}` };
    }
    if (available < item.quantity) {
      return { ok: false, error: `Insufficient stock for ${item.name || pid}` };
    }
  }

  // 2) Bulk decrement inventory (one write).
  const ops = orderItems.map((item) => {
    const colorName = item?.selectedColor?.name || item?.selectedColor;
    return {
      updateOne: {
        filter: {
          _id: item.product,
          variants: {
            $elemMatch: {
              size: item.selectedSize,
              'color.name': colorName,
              stock: { $gte: item.quantity },
            },
          },
        },
        update: {
          $inc: { 'variants.$[v].stock': -item.quantity },
        },
        arrayFilters: [{ 'v.size': item.selectedSize, 'v.color.name': colorName }],
      },
    };
  });

  const tWrite0 = Date.now();
  const bulkResult = await Product.bulkWrite(ops, { ordered: true });
  const writeMs = Date.now() - tWrite0;
  if (writeMs > 400) {
    console.warn('Slow Mongo bulkWrite inventory:', { writeMs, items: ops.length });
  }

  // If some updates didn't match, treat as failure (concurrent stock race).
  if (bulkResult.matchedCount !== ops.length) {
    console.warn('Inventory update mismatch:', {
      jobId: job?.id,
      matched: bulkResult.matchedCount,
      expected: ops.length,
    });
    return { ok: false, error: 'Stock changed, please retry checkout' };
  }

  // 3) Create the order.
  const order = new Order({
    checkoutJobId: job.id,
    user: userId,
    orderNumber: payload.orderNumber,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice: payload.itemsPrice,
    taxPrice: payload.taxPrice,
    shippingPrice: payload.shippingPrice,
    totalPrice: payload.totalPrice,
    isPaid: paymentMethod !== 'Cash on Delivery',
    isDelivered: false,
  });

  let createdOrder;
  try {
    const tOrder0 = Date.now();
    createdOrder = await order.save();
    const orderMs = Date.now() - tOrder0;
    if (orderMs > 250) {
      console.warn('Slow Mongo order save:', { orderMs });
    }
  } catch (err) {
    // Idempotency: if this job already created an order, treat as success.
    if (err?.code === 11000) {
      createdOrder = await Order.findOne({ checkoutJobId: job.id }).lean();
    } else {
      throw err;
    }
  }

  // 4) Send email (best-effort).
  if (userEmail && createdOrder) {
    try {
      const html = generateOrderPlacedEmail(createdOrder);
      const tEmail0 = Date.now();
      await sendEmail({
        to: userEmail,
        subject: `Order Confirmation - ${createdOrder.orderNumber}`,
        html,
      });
      const emailMs = Date.now() - tEmail0;
      if (emailMs > 1500) {
        console.warn('Slow email send:', { emailMs });
      }
    } catch (emailError) {
      console.error('Worker failed to send order email:', emailError);
    }
  }

  return { ok: true, orderId: createdOrder?._id?.toString?.() || null };
}

async function runOnce({ maxJobs }) {
  await dbConnect();

  const jobs = await dequeueCheckoutJobs(maxJobs);
  const results = [];

  for (const job of jobs) {
    try {
      await setCheckoutJobStatus(job?.id, {
        state: 'processing',
        jobId: job?.id,
        userId: job?.payload?.user?.id || null,
        orderNumber: job?.payload?.orderNumber,
        startedAt: Date.now(),
      });

      const result = await processJob(job);

      if (result?.ok) {
        await setCheckoutJobStatus(job?.id, {
          state: 'succeeded',
          jobId: job?.id,
          userId: job?.payload?.user?.id || null,
          orderNumber: job?.payload?.orderNumber,
          orderId: result?.orderId || null,
          finishedAt: Date.now(),
        });
      } else {
        await setCheckoutJobStatus(job?.id, {
          state: 'failed',
          jobId: job?.id,
          userId: job?.payload?.user?.id || null,
          orderNumber: job?.payload?.orderNumber,
          error: result?.error || 'Job failed',
          finishedAt: Date.now(),
        });
        await moveToDeadLetter(job, result?.error || 'Job failed');
      }

      results.push({ jobId: job?.id, ...result });
    } catch (err) {
      console.error('Worker job failed:', err);

      await setCheckoutJobStatus(job?.id, {
        state: 'failed',
        jobId: job?.id,
        userId: job?.payload?.user?.id || null,
        orderNumber: job?.payload?.orderNumber,
        error: err?.message || 'Job failed',
        finishedAt: Date.now(),
      });
      await moveToDeadLetter(job, err?.message || 'Job failed');

      results.push({ jobId: job?.id, ok: false, error: err?.message || 'Job failed' });
    }
  }

  return { processed: results.length, results };
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const maxJobs = Math.min(Number(url.searchParams.get('max') || 10) || 10, 25);

  try {
    const out = await runOnce({ maxJobs });
    return NextResponse.json({ success: true, ...out });
  } catch (err) {
    console.error('Worker run failed:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Worker failed' }, { status: 500 });
  }
}

export async function POST(request) {
  return GET(request);
}
