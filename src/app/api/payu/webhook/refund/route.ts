import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { serializeRedactedPaymentPayload } from '@/lib/paymentPayload';

const PAYU_WEBHOOK_IPS = new Set([
  // Test
  '180.179.174.1',
  '3.6.73.183',
  '3.6.83.44',
  // Production DC
  '3.7.89.1',
  '3.7.89.2',
  '3.7.89.3',
  // Production DR
  '52.140.8.88',
  '52.140.8.89',
  '52.140.8.64',
]);

function getClientIp(req: Request) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    ''
  );
}

function isAllowedPayuSource(req: Request) {
  const configuredIps = process.env.PAYU_WEBHOOK_ALLOWED_IPS
    ?.split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
  const allowlist = configuredIps?.length ? new Set(configuredIps) : PAYU_WEBHOOK_IPS;

  const clientIp = getClientIp(req);
  if (allowlist.has(clientIp)) return true;

  // Keep local webhook testing usable; production should see a real forwarded IP.
  return process.env.NODE_ENV !== 'production' && !clientIp;
}

function verifyOptionalWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const secret = process.env.PAYU_WEBHOOK_SECRET || process.env.PAYU_MERCHANT_SALT;
  if (!secret) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const received = signature.replace(/^sha256=/i, '');
  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(received, 'hex');

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

function parseAmountPaise(amount: unknown) {
  if (amount === undefined || amount === null || amount === '') return undefined;
  const parsed = Number.parseFloat(String(amount));
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error('Invalid amount');
  return Math.round(parsed * 100);
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function findOrder(txnId: string) {
  return prisma.order.findFirst({
    where: {
      OR: [
        { merchantTransactionId: txnId },
        { payuTransactionId: txnId },
      ],
    },
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get('x-payu-signature') ||
      req.headers.get('x-webhook-signature') ||
      req.headers.get('x-signature');

    if (!verifyOptionalWebhookSignature(rawBody, signature) && !isAllowedPayuSource(req)) {
      console.error('PayU refund/dispute webhook source verification failed:', getClientIp(req) || 'missing-ip');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = JSON.parse(rawBody);
    const action = normalizeText(data.action || data.event);

    if (action === 'refund') {
      const merchantTxnId = normalizeText(data.merchantTxnId || data.txnid);
      const status = normalizeText(data.status);
      const mihpayid = normalizeText(data.mihpayid);
      const amount = data.amt ?? data.amount;
      const key = normalizeText(data.key);

      if (!merchantTxnId) {
        return NextResponse.json({ error: 'Missing merchantTxnId' }, { status: 400 });
      }

      if (process.env.PAYU_MERCHANT_KEY && key !== process.env.PAYU_MERCHANT_KEY) {
        console.error('PayU refund webhook merchant key mismatch for txnid:', merchantTxnId);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const order = await findOrder(merchantTxnId);
      if (!order) {
        console.error('Refund webhook order not found for txnid:', merchantTxnId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      await prisma.paymentEvent.create({
        data: {
          eventType: 'refund',
          txnId: merchantTxnId,
          mihpayid: mihpayid || null,
          status: status,
          amount: amount?.toString(),
          source: 'webhook',
          rawPayload: serializeRedactedPaymentPayload(data),
        }
      });

      // Update Order Refund Status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          refundStatus: status === 'success' ? 'SUCCESS' : 'FAILED',
          refundAmount: parseAmountPaise(amount),
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (action === 'dispute' || action === 'chargeback') {
      const txnId = normalizeText(data.merchantTxnId || data.txnid || data.txn_id);
      const status = normalizeText(data.cb_status || data.status || action);
      const amount = data.cb_amount ?? data.amount;

      if (!txnId) {
        return NextResponse.json({ error: 'Missing txn_id' }, { status: 400 });
      }

      const order = await findOrder(txnId);
      if (!order) {
        console.error('Dispute webhook order not found for txnid:', txnId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      await prisma.paymentEvent.create({
        data: {
          eventType: 'dispute',
          txnId,
          mihpayid: null,
          status: status,
          amount: amount?.toString(),
          source: 'webhook',
          rawPayload: serializeRedactedPaymentPayload(data),
        }
      });

      // Update Order Dispute Status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          disputeStatus: 'OPEN',
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Unhandled action
    return NextResponse.json({ success: true, message: 'Action ignored' }, { status: 200 });

  } catch (error) {
    console.error('PayU Refund/Dispute Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
