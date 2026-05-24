import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { processPayuResult } from '@/lib/payuProcessing';

export const dynamic = 'force-dynamic';

function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.keshvicrafts.in').replace(/\/$/, '');
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a, 'hex');
  const bBuffer = Buffer.from(b, 'hex');
  return aBuffer.length === bBuffer.length && crypto.timingSafeEqual(aBuffer, bBuffer);
}

export async function GET() {
  const baseUrl = getBaseUrl();
  return NextResponse.redirect(`${baseUrl}/checkout?error=invalid_payment_return`, 303);
}

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
      udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '',
      // udf6 to udf10 are usually empty but good to extract just in case, though the hash formula mainly uses 1-5
    } = data;

    const salt = process.env.PAYU_MERCHANT_SALT || '';

    // Verify the Hash
    // Success Hash Formula: sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    const hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    if (!payuHash || !safeCompare(calculatedHash, payuHash)) {
      console.error('PayU response hash mismatch for txnid:', txnid || 'missing');
      const baseUrl = getBaseUrl();
      return NextResponse.redirect(`${baseUrl}/checkout?error=hash_mismatch`, 303);
    }

    try {
      await processPayuResult(data, 'redirect');
    } catch (processingError) {
      const message = processingError instanceof Error ? processingError.message : '';
      console.error('PayU response processing failed for txnid:', txnid || 'missing', processingError);
      const baseUrl = getBaseUrl();
      if (message === 'ORDER_NOT_FOUND') {
        return NextResponse.redirect(`${baseUrl}/checkout?error=order_not_found`, 303);
      }
      if (message === 'AMOUNT_MISMATCH') {
        return NextResponse.redirect(`${baseUrl}/checkout?error=amount_mismatch`, 303);
      }
      return NextResponse.redirect(`${baseUrl}/checkout?error=server_error`, 303);
    }

    const baseUrl = getBaseUrl();
    if (status === 'success') {
      return NextResponse.redirect(`${baseUrl}/checkout/success?txnid=${txnid}`, 303);
    } else {
      return NextResponse.redirect(`${baseUrl}/checkout?error=payment_failed`, 303);
    }

  } catch (error) {
    console.error('PayU Response Error:', error);
    const baseUrl = getBaseUrl();
    return NextResponse.redirect(`${baseUrl}/checkout?error=server_error`, 303);
  }
}
