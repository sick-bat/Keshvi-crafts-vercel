import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());

    // PayU sends these fields back in the POST request
    const {
      status,
      firstname,
      amount,
      txnid,
      hash: payuHash,
      key,
      productinfo,
      email,
      mihpayid,
      udf1, udf2, udf3, udf4, udf5, udf6, udf7, udf8, udf9, udf10
    } = data as Record<string, string>;

    const salt = process.env.PAYU_MERCHANT_SALT;

    // Verify the Hash
    // Success Hash Formula: sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    // Note: if additional udf fields are sent, they must be included in reverse order up to udf1.
    // For our implementation, we didn't send any udf fields, so they are empty.
    const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    if (calculatedHash !== payuHash) {
      console.error('Hash Mismatch! Potential Tampering. Calculated:', calculatedHash, 'Received:', payuHash);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=hash_mismatch`);
    }

    // Hash is valid, update database
    const orderStatus = status === 'success' ? 'PAID' : 'FAILED';
    const payuTransactionId = mihpayid; // PayU's internal ID

    await prisma.order.update({
      where: { merchantTransactionId: txnid },
      data: {
        status: orderStatus,
        payuTransactionId,
        payuStatus: status,
      },
    });

    if (status === 'success') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?txnid=${txnid}`);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=payment_failed`);
    }

  } catch (error) {
    console.error('PayU Response Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=server_error`);
  }
}
