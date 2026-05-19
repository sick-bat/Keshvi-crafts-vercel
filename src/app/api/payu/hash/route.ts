// THis has been created for PayU

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formData, cart, grandTotal } = body;

    // 1. Generate a unique merchant transaction ID
    const merchantTransactionId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    // 2. Convert total to paise (integer) to avoid floating point errors
    const totalAmountPaise = Math.round(grandTotal * 100);

    // 3. Save Order to Database (PENDING status)
    const order = await prisma.order.create({
      data: {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email || null,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        orderNote: formData.orderNote || null,
        totalAmountPaise,
        paymentMethod: 'PAYU',
        status: 'PENDING',
        merchantTransactionId,
        items: {
          create: cart.map((item: any) => ({
            productId: item.slug || item.productSlug,
            productTitle: item.title,
            quantity: item.qty,
            priceAtPurchasePaise: Math.round(item.price * 100),
          })),
        },
      },
    });

    // 4. Generate PayU Hash
    const key = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_MERCHANT_SALT;
    const amount = grandTotal.toFixed(2); // PayU expects exact decimal string format for hash like "100.00"
    const productInfo = "Order"; // Simplify productInfo to avoid space-related issues
    const firstName = formData.fullName.split(' ')[0] || 'Customer';
    const email = formData.email || 'customer@example.com';

    // Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
    // Using array join to guarantee exactly 11 pipes after email.
    const hashParts = [
      key, merchantTransactionId, amount, productInfo, firstName, email,
      '', '', '', '', '', '', '', '', '', '', salt
    ];
    const hashString = hashParts.join('|');
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const actionUrl = process.env.PAYU_ENV === 'secure' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment';

    return NextResponse.json({
      success: true,
      hash,
      txnid: merchantTransactionId,
      amount,
      productInfo,
      firstName,
      email,
      key,
      surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payu/response`,
      furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payu/response`,
      actionUrl,
    });

  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
