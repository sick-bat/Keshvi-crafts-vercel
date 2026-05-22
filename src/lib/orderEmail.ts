import prisma from "@/lib/prisma";
import { formatDeliveryRange } from "@/lib/deliveryEstimate";

type OrderForEmail = {
  id: string;
  merchantTransactionId: string | null;
  fullName: string;
  email: string | null;
  totalAmountPaise: number;
  createdAt: Date;
  items: Array<{
    productTitle: string;
    quantity: number;
    priceAtPurchasePaise: number;
  }>;
};

function getRequiredEmailEnv() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const replyTo = process.env.RESEND_REPLY_TO || process.env.RESEND_REPLY_TO_EMAIL || process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) return null;
  return { apiKey, from, replyTo };
}

function formatInr(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(paise / 100));
}

function buildOrderEmail(order: OrderForEmail) {
  const orderNumber = order.merchantTransactionId || order.id;
  const deliveryRange = formatDeliveryRange(order.createdAt);
  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eadfcd;">${item.quantity}x ${item.productTitle}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eadfcd;text-align:right;">${formatInr(item.priceAtPurchasePaise * item.quantity)}</td>
        </tr>
      `
    )
    .join("");

  return {
    subject: `Keshvi Crafts order confirmed: ${orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2f2a26;max-width:640px;margin:0 auto;">
        <h1 style="font-family:Georgia,serif;color:#2f2a26;">Thank you for your order</h1>
        <p>Hi ${order.fullName},</p>
        <p>Your Keshvi Crafts order is confirmed and will be handmade with care.</p>
        <p><strong>Order number:</strong> ${orderNumber}</p>
        <p><strong>Estimated delivery:</strong> ${deliveryRange}</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          ${itemRows}
          <tr>
            <td style="padding:12px 0;font-weight:bold;">Total paid</td>
            <td style="padding:12px 0;text-align:right;font-weight:bold;">${formatInr(order.totalAmountPaise)}</td>
          </tr>
        </table>
        <p>We will contact you if we need anything for customization or delivery.</p>
        <p style="color:#6a6150;font-size:14px;">Keshvi Crafts<br/>Handmade with care in India</p>
      </div>
    `,
  };
}

export async function sendOrderConfirmationEmail(orderId: string) {
  const env = getRequiredEmailEnv();
  if (!env) return { sent: false, reason: "email_not_configured" };

  const existing = await prisma.paymentEvent.findFirst({
    where: {
      txnId: orderId,
      eventType: "email",
      source: "resend",
      status: "sent",
    },
  });
  if (existing) return { sent: false, reason: "already_sent" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order?.email) return { sent: false, reason: "missing_email" };

  const email = buildOrderEmail(order);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.from,
      to: order.email,
      reply_to: env.replyTo,
      subject: email.subject,
      html: email.html,
    }),
  });

  const responseBody = await response.text();
  await prisma.paymentEvent.create({
    data: {
      eventType: "email",
      txnId: order.id,
      mihpayid: order.payuTransactionId,
      status: response.ok ? "sent" : "failed",
      amount: null,
      source: "resend",
      rawPayload: response.ok ? "{}" : JSON.stringify({ status: response.status, body: responseBody.slice(0, 500) }),
    },
  });

  return { sent: response.ok, reason: response.ok ? "sent" : "resend_failed" };
}
