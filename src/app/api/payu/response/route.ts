import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { serializeRedactedPaymentPayload } from '@/lib/paymentPayload';
import { sendOrderConfirmationEmail } from '@/lib/orderEmail';

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

    const order = await prisma.order.findUnique({
      where: { merchantTransactionId: txnid },
    });

    if (!order) {
      console.error('PayU response order not found for txnid:', txnid || 'missing');
      const baseUrl = getBaseUrl();
      return NextResponse.redirect(`${baseUrl}/checkout?error=order_not_found`, 303);
    }

    const payloadAmountPaise = Math.round(Number.parseFloat(amount) * 100);
    if (!Number.isFinite(payloadAmountPaise) || payloadAmountPaise !== order.totalAmountPaise) {
      console.error('PayU response amount mismatch for txnid:', txnid || 'missing');
      const baseUrl = getBaseUrl();
      return NextResponse.redirect(`${baseUrl}/checkout?error=amount_mismatch`, 303);
    }

    // Log to PaymentEvent (Idempotent tracking)
    try {
      await prisma.paymentEvent.create({
        data: {
          eventType: 'payment',
          txnId: txnid,
          mihpayid: mihpayid || null,
          status: status,
          amount: amount,
          source: 'redirect',
          rawPayload: serializeRedactedPaymentPayload(data),
        }
      });
    } catch (e) {
      // If event creation fails (e.g. DB error), log it but don't block the UI redirect
      console.error('Failed to log PaymentEvent from redirect:', e);
    }

    const orderStatus = status === 'success' ? 'PAID' : 'FAILED';
    const payuTransactionId = mihpayid; // PayU's internal ID

    const updatedOrder = await prisma.order.update({
      where: { merchantTransactionId: txnid },
      data: {
        status: orderStatus,
        payuTransactionId,
        payuStatus: status,
      },
    });

    if (orderStatus === 'PAID') {
      try {
        const emailResult = await sendOrderConfirmationEmail(updatedOrder.id);
        if (!emailResult.sent && emailResult.reason !== 'already_sent') {
          console.warn('Order confirmation email was not sent for txnid:', txnid, emailResult.reason);
        }
      } catch (emailError) {
        console.error('Order confirmation email failed for txnid:', txnid, emailError);
      }
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
