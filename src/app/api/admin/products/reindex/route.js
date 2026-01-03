import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

function normalize(value) {
  return (value || '').toString().trim().toLowerCase();
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  // Backfill normalized fields for existing products.
  // Uses bulkWrite for speed.
  const cursor = Product.find({}, { _id: 1, name: 1, category: 1 }).lean().cursor();

  const bulk = [];
  let scanned = 0;
  let updated = 0;

  for await (const doc of cursor) {
    scanned += 1;
    const nameNormalized = normalize(doc.name);
    const categoryNormalized = normalize(doc.category);

    bulk.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { nameNormalized, categoryNormalized } },
      },
    });

    if (bulk.length >= 500) {
      const result = await Product.bulkWrite(bulk, { ordered: false });
      updated +=
        (result.modifiedCount || 0) +
        (result.upsertedCount || 0) +
        (result.matchedCount ? 0 : 0);
      bulk.length = 0;
    }
  }

  if (bulk.length) {
    const result = await Product.bulkWrite(bulk, { ordered: false });
    updated += (result.modifiedCount || 0) + (result.upsertedCount || 0);
  }

  return NextResponse.json({ success: true, scanned, updated });
}
