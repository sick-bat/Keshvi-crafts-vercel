import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { serializeRedactedPaymentPayload } from '@/lib/paymentPayload';
import { sendOrderConfirmationEmail } from '@/lib/orderEmail';

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

    // Idempotency: Check if already processed as a webhook
    const existingEvent = await prisma.paymentEvent.findFirst({
      where: {
        txnId: txnid,
        source: 'webhook',
        status: status,
      }
    });

    if (existingEvent) {
      console.log(`Webhook already processed for txnid: ${txnid} with status: ${status}`);
      return NextResponse.json({ success: true, message: 'Already processed' }, { status: 200 });
    }

    // Log the Webhook Event
    await prisma.paymentEvent.create({
      data: {
        eventType: 'payment',
        txnId: txnid,
        mihpayid: mihpayid || null,
        status: status,
        amount: amount,
        source: 'webhook',
        rawPayload: serializeRedactedPaymentPayload(data),
      }
    });

    // Amount & TxnId Verification against Order
    const order = await prisma.order.findUnique({
      where: { merchantTransactionId: txnid }
    });

    if (!order) {
      console.error(`Order not found for txnid: ${txnid}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify amount (PayU sends amount as string e.g., "100.00", database stores paise e.g., 10000)
    const payloadAmountPaise = Math.round(parseFloat(amount) * 100);
    if (payloadAmountPaise !== order.totalAmountPaise) {
      console.error(`Amount mismatch for txnid: ${txnid}. DB: ${order.totalAmountPaise}, PayU: ${payloadAmountPaise}`);
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Safely update Order Status
    const orderStatus = status === 'success' ? 'PAID' : 'FAILED';
    const updatedOrder = await prisma.order.update({
      where: { merchantTransactionId: txnid },
      data: {
        status: orderStatus,
        payuTransactionId: mihpayid,
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

    // PayU expects a 200 OK to stop retrying
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('PayU Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
