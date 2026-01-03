// Brand Constants
const BRAND = {
    name: 'MAY BE NOT',
    supportEmail: 'support@maybenot.com',
    primaryColor: '#000000',
    website: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
};

// Utilities
const formatPrice = (v) => `₹${Number(v || 0).toFixed(2)}`;

const getAbsoluteUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // Remove leading slash if both have it or add if neither to strictly join
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
};

const formatAddress = (address) => {
    if (!address) return '';
    const lines = [
        address.addressLine1 || address.address,
        address.addressLine2
    ].filter(Boolean);
    const cityState = [
        address.city,
        address.state,
        address.postalCode
    ].filter(Boolean).join(', ');

    return {
        fullName: address.fullName || `${address.firstName || ''} ${address.lastName || ''}`.trim() || 'Customer',
        lines,
        cityState,
        country: address.country
    };
};

const renderHeader = (title) => `
    <div style="background-color: ${BRAND.primaryColor}; padding: 30px; text-align: center;">
        <div style="background-color: #ffffff; padding: 15px 20px; display: inline-block; border-radius: 4px;">
            <img src="${getAbsoluteUrl('/brand.svg')}" alt="${BRAND.name}" style="max-height: 60px; width: auto; object-fit: contain; display: block;" />
        </div>
        <h1 style="color: #ffffff; margin-top: 25px; font-size: 24px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase;">${title}</h1>
    </div>
`;

const renderFooter = () => `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="font-size: 11px; color: #aaa; margin-bottom: 10px; font-style: italic;">
            Designed for those who choose not to be ordinary.
        </p>
        <p style="font-size: 12px; color: #999; line-height: 1.5;">
            If you have any questions, reply to this email or contact us at <a href="mailto:${BRAND.supportEmail}" style="color: #999; text-decoration: underline;">${BRAND.supportEmail}</a>.<br>
            &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
        </p>
    </div>
`;

export const generateOrderPlacedEmail = (order) => {
    const formattedAddr = formatAddress(order.shippingAddress);

    const itemsList = order.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; width: 60px;">
                <img src="${getAbsoluteUrl(item.image)}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <div style="font-weight: 600; font-size: 14px; color: #333;">${item.name}</div>
                <div style="font-size: 12px; color: #888; margin-top: 4px;">Size: ${item.selectedSize} | Color: ${item.selectedColor?.name || '-'}</div>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price)}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                
                ${renderHeader('Order Confirmed')}

                <div style="padding: 40px 30px;">
                    <!-- Greeting -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Hi <strong>${formattedAddr.fullName}</strong>,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">Thank you for choosing ${BRAND.name} — where understated meets bold.</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">We've received your order and are getting it ready. We will shortly update you with the shipping details.</p>
                        
                        <div style="display: inline-block; background-color: #f8f8f8; padding: 12px 24px; border-radius: 4px; border: 1px solid #eee; margin-top: 15px;">
                            <span style="font-size: 14px; color: #888;">Order Number</span><br>
                            <span style="font-size: 18px; font-weight: bold; color: #333;">${order.orderNumber}</span>
                        </div>

                        <!-- Payment Method & Delivery Estimate -->
                         <div style="margin-top: 15px; font-size: 14px; color: #666;">
                            <p style="margin: 5px 0;">Paid via: <strong>${order.paymentMethod}</strong></p>
                            <p style="margin: 5px 0;">Estimated Delivery: <strong>5–7 business days</strong></p>
                        </div>

                        <!-- CTA -->
                        <div style="margin-top: 25px;">
                             <a href="${BRAND.website}/account/orders/${order._id}" style="background-color: #000000; color: #ffffff; padding: 14px 28px; text-decoration: none; display: inline-block; font-size: 14px; text-transform: uppercase; font-weight: bold; border-radius: 2px;">View Order</a>
                        </div>
                    </div>

                    <!-- Order Items -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
                        <thead>
                            <tr style="border-bottom: 2px solid #333;">
                                <th style="padding: 10px; text-align: left; color: #333; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; width: 60px;">Image</th>
                                <th style="padding: 10px; text-align: left; color: #333; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Item</th>
                                <th style="padding: 10px; text-align: center; color: #333; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Qty</th>
                                <th style="padding: 10px; text-align: right; color: #333; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList}
                        </tbody>
                        <tfoot>
                             <tr>
                                <td colspan="3" style="padding: 10px; padding-top: 20px; text-align: right; color: #666;">Subtotal</td>
                                <td style="padding: 10px; padding-top: 20px; text-align: right; font-weight: 600;">${formatPrice(order.itemsPrice)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" style="padding: 5px 10px; text-align: right; color: #666;">Shipping</td>
                                <td style="padding: 5px 10px; text-align: right;">${order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</td>
                            </tr>
                             <tr>
                                <td colspan="3" style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 16px; border-top: 1px solid #eee;">Total</td>
                                <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 16px; border-top: 1px solid #eee;">${formatPrice(order.totalPrice)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <!-- Shipping Address -->
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px;">
                        <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 10px;">Shipping Address</h3>
                        <p style="margin: 0; line-height: 1.6; color: #333; font-size: 14px;">
                            <strong>${formattedAddr.fullName}</strong><br>
                            ${formattedAddr.lines.join('<br>')}<br>
                            ${formattedAddr.cityState}<br>
                            ${formattedAddr.country}
                        </p>
                    </div>

                    ${renderFooter()}
                </div>
            </div>
        </body>
        </html>
    `;
};

export const generateOrderShippedEmail = (order) => {
    const formattedAddr = formatAddress(order.shippingAddress);

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Shipped</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                
                ${renderHeader('Order Shipped')}

                <div style="padding: 40px 30px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Hi <strong>${formattedAddr.fullName}</strong>,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">Good news! Your order <strong>${order.orderNumber}</strong> has been shipped and is on its way.</p>
                        <p style="font-size: 14px; color: #777; margin-top: 10px;">You'll receive another update once your package is out for delivery.</p>
                    </div>

                    ${order.trackingDetails ? `
                    <div style="background-color: #f0f7ff; padding: 20px; border-radius: 6px; border: 1px solid #d0e3ff; margin-bottom: 30px; text-align: center;">
                        <h3 style="color: #0056b3; font-size: 14px; text-transform: uppercase; margin: 0 0 15px 0; letter-spacing: 0.5px;">Tracking Information</h3>
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #555;"><strong>Provider:</strong> ${order.trackingDetails.provider || 'Standard Shipping'}</p>
                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #555;"><strong>Tracking Number:</strong> ${order.trackingDetails.trackingNumber}</p>
                        
                        ${order.trackingDetails.url ? `
                        <div style="margin-top: 20px;">
                            <a href="${order.trackingDetails.url}" style="background-color: #000000; color: white; padding: 12px 25px; text-decoration: none; border-radius: 2px; display: inline-block; font-size: 14px; font-weight: bold; text-transform: uppercase;">Track Package</a>
                        </div>
                        ` : ''}

                        <p style="font-size: 12px; color: #777; margin-top: 15px;">
                            Tracking not updating? <a href="mailto:${BRAND.supportEmail}" style="color: #007bff; text-decoration: underline;">Contact support anytime</a>.
                        </p>
                    </div>
                    ` : ''}

                    <div style="margin-bottom: 30px;">
                        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">Items in this Shipment</h3>
                         <ul style="list-style: none; padding: 0; margin: 0;">
                            ${order.items.map(item => `
                                <li style="padding: 10px 0; border-bottom: 1px solid #fafafa; display: flex; align-items: center;">
                                    <img src="${getAbsoluteUrl(item.image)}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 15px;" />
                                    <div style="flex: 1;">
                                        <div style="font-weight: 500; font-size: 14px;">${item.name}</div>
                                        <div style="color: #888; font-size: 12px;">Qty: ${item.quantity}</div>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    ${renderFooter()}
                </div>
            </div>
        </body>
        </html>
    `;
};
