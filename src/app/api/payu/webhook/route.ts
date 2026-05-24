import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { processPayuResult } from '@/lib/payuProcessing';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    const {
      status = '',
      firstname = '',
      amount = '',
      txnid = '',
      hash: payuHash = '',
      key = '',
      productinfo = '',
      email = '',
      mihpayid = '',
      udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = ''
    } = data;

    const salt = process.env.PAYU_MERCHANT_SALT || '';

    // Verify Hash
    const hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    if (calculatedHash !== payuHash) {
      console.error('PayU payment webhook hash mismatch for txnid:', txnid || 'missing');
      // Return 400 so PayU knows it failed, though they may retry
      return NextResponse.json({ error: 'Hash mismatch' }, { status: 400 });
    }

    try {
      await processPayuResult(data, 'webhook');
    } catch (processingError) {
      const message = processingError instanceof Error ? processingError.message : '';
      if (message === 'ORDER_NOT_FOUND') {
        console.error(`Order not found for txnid: ${txnid}`);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      if (message === 'AMOUNT_MISMATCH') {
        console.error(`Amount mismatch for txnid: ${txnid}`);
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }
      throw processingError;
    }

    // PayU expects a 200 OK to stop retrying
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('PayU Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
