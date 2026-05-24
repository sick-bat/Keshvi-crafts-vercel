import prisma from "@/lib/prisma";
import { formatDeliveryRange } from "@/lib/deliveryEstimate";
import { ensureInvoiceDownloadLink } from "@/lib/invoice";
import { Prisma } from "@prisma/client";

const EMAIL_PROCESSING_TIMEOUT_MS = 5 * 60 * 1000;

type OrderForEmail = {
  id: string;
  merchantTransactionId: string | null;
  fullName: string;
  email: string | null;
  address: string;
  city: string;
  pincode: string;
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

function buildOrderEmail(order: OrderForEmail, invoiceUrl?: string) {
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
        <h1 style="font-family:Georgia,serif;color:#2f2a26;">Your Keshvi Crafts order is confirmed</h1>
        <p>Hi ${order.fullName},</p>
        <p>Thank you for becoming a small but meaningful part of the Keshvi Crafts story. Your order means more than a purchase to us. It supports hours of handwork, patience, creativity, and the dream behind every handmade piece we create.</p>
        <p>We have received your payment successfully, and our team will now begin preparing your order with care.</p>

        <h2 style="font-family:Georgia,serif;color:#2f2a26;font-size:20px;margin-top:24px;">Order Summary</h2>
        <p>
          <strong>Order ID:</strong> ${orderNumber}<br/>
          <strong>Payment Status:</strong> PAID<br/>
          <strong>Order Status:</strong> CONFIRMED<br/>
          <strong>Order Date:</strong> ${new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(order.createdAt)}<br/>
          <strong>Estimated delivery:</strong> ${deliveryRange}<br/>
          <strong>Total Paid:</strong> ${formatInr(order.totalAmountPaise)}
        </p>

        <h2 style="font-family:Georgia,serif;color:#2f2a26;font-size:20px;margin-top:24px;">Your Items</h2>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          ${itemRows}
          <tr>
            <td style="padding:12px 0;font-weight:bold;">Total paid</td>
            <td style="padding:12px 0;text-align:right;font-weight:bold;">${formatInr(order.totalAmountPaise)}</td>
          </tr>
        </table>

        <h2 style="font-family:Georgia,serif;color:#2f2a26;font-size:20px;margin-top:24px;">Delivery Address</h2>
        <p>${order.address}, ${order.city} - ${order.pincode}</p>

        <h2 style="font-family:Georgia,serif;color:#2f2a26;font-size:20px;margin-top:24px;">What happens next?</h2>
        <p>We will carefully prepare and pack your order. Once it is shipped, we will share the delivery update with you.</p>
        ${
          invoiceUrl
            ? `
              <p>Your invoice is ready for your records.</p>
              <p style="margin:24px 0;">
                <a href="${invoiceUrl}" style="display:inline-block;background:#8b5e3c;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:bold;">
                  Download Invoice
                </a>
              </p>
            `
            : ""
        }
        <p>Need help? Just reply to this email or contact us at <a href="mailto:keshvicrafts@gmail.com" style="color:#8b5e3c;">keshvicrafts@gmail.com</a>.</p>
        <p>With gratitude,<br/><strong>Vaishnavi</strong><br/>Founder, Keshvi Crafts</p>
        <p style="color:#6a6150;font-size:14px;">Keshvi Crafts<br/>Handmade with care in India</p>
      </div>
    `,
  };
}

export async function sendOrderConfirmationEmail(orderId: string) {
  const env = getRequiredEmailEnv();
  if (!env) return { sent: false, reason: "email_not_configured" };

  const emailEventId = `email_${orderId}`;

  try {
    await prisma.paymentEvent.create({
      data: {
        id: emailEventId,
        eventType: "email",
        txnId: orderId,
        mihpayid: null,
        status: "processing",
        amount: null,
        source: "resend",
        rawPayload: "{}",
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await prisma.paymentEvent.findUnique({ where: { id: emailEventId } });
      if (existing?.status === "sent") {
        return { sent: false, reason: "already_sent" };
      }
      if (
        existing?.status === "processing" &&
        Date.now() - existing.processedAt.getTime() < EMAIL_PROCESSING_TIMEOUT_MS
      ) {
        return { sent: false, reason: "already_processing" };
      }
      await prisma.paymentEvent.update({
        where: { id: emailEventId },
        data: {
          status: "processing",
          rawPayload: "{}",
          processedAt: new Date(),
        },
      });
    } else {
      throw error;
    }
  }

  const existingSent = await prisma.paymentEvent.findFirst({
    where: {
      id: { not: emailEventId },
      txnId: orderId,
      eventType: "email",
      source: "resend",
      status: "sent",
    },
  });
  if (existingSent) {
    await prisma.paymentEvent.update({
      where: { id: emailEventId },
      data: { status: "sent", rawPayload: JSON.stringify({ reason: "sent_by_existing_event" }) },
    });
    return { sent: false, reason: "already_sent" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order?.email) {
    await prisma.paymentEvent.update({
      where: { id: emailEventId },
      data: { status: "failed", rawPayload: JSON.stringify({ reason: "missing_email" }) },
    });
    return { sent: false, reason: "missing_email" };
  }

  let invoiceLink: Awaited<ReturnType<typeof ensureInvoiceDownloadLink>> = null;
  try {
    invoiceLink = await ensureInvoiceDownloadLink(orderId);
  } catch (invoiceError) {
    console.error("Invoice link creation failed for order:", orderId, invoiceError);
  }
  const email = buildOrderEmail(order, invoiceLink?.url);
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
  await prisma.paymentEvent.update({
    where: { id: emailEventId },
    data: {
      mihpayid: order.payuTransactionId,
      status: response.ok ? "sent" : "failed",
      rawPayload: response.ok
        ? JSON.stringify({ invoiceId: invoiceLink?.invoice.id || null })
        : JSON.stringify({ status: response.status, body: responseBody.slice(0, 500) }),
      processedAt: new Date(),
    },
  });

  return { sent: response.ok, reason: response.ok ? "sent" : "resend_failed" };
}
