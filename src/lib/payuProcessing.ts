import prisma from "@/lib/prisma";
import { serializeRedactedPaymentPayload } from "@/lib/paymentPayload";
import { sendOrderConfirmationEmail } from "@/lib/orderEmail";
import type { Prisma } from "@prisma/client";

type PayuPayload = Record<string, string>;
type PayuSource = "redirect" | "webhook";

function mapPayuPaymentStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "success") return "PAID";
  if (normalized === "failure" || normalized === "failed") return "FAILED";
  return "PENDING";
}

function parseAmountPaise(amount: string) {
  const parsed = Number.parseFloat(amount);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100);
}

async function createPaymentEventOnce(data: PayuPayload, source: PayuSource) {
  const txnId = data.txnid || "";
  const status = data.status || "";
  const mihpayid = data.mihpayid || null;

  const existing = await prisma.paymentEvent.findFirst({
    where: {
      eventType: "payment",
      txnId,
      source,
      status,
      mihpayid,
    },
  });
  if (existing) return existing;

  return prisma.paymentEvent.create({
    data: {
      eventType: "payment",
      txnId,
      mihpayid,
      status,
      amount: data.amount || null,
      source,
      rawPayload: serializeRedactedPaymentPayload(data),
    },
  });
}

async function createTimelineEvent(params: {
  orderId: string;
  eventType: string;
  fromValue?: string | null;
  toValue?: string | null;
  actorType: "PAYU" | "SYSTEM" | "ADMIN";
  actorId?: string | null;
  note?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.orderTimelineEvent.create({
    data: {
      orderId: params.orderId,
      eventType: params.eventType,
      fromValue: params.fromValue || null,
      toValue: params.toValue || null,
      actorType: params.actorType,
      actorId: params.actorId || null,
      note: params.note || null,
      metadata: params.metadata || undefined,
    },
  });
}

export async function processPayuResult(data: PayuPayload, source: PayuSource) {
  const txnid = data.txnid || "";
  const payuStatus = (data.status || "").toLowerCase();
  const mihpayid = data.mihpayid || "";

  const order = await prisma.order.findUnique({
    where: { merchantTransactionId: txnid },
  });

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const payloadAmountPaise = parseAmountPaise(data.amount || "");
  if (payloadAmountPaise === null || payloadAmountPaise !== order.totalAmountPaise) {
    throw new Error("AMOUNT_MISMATCH");
  }

  await createPaymentEventOnce(data, source);

  const nextPaymentStatus = mapPayuPaymentStatus(payuStatus);
  const updateData: {
    paymentStatus?: string;
    orderStatus?: string;
    payuTransactionId?: string;
    payuStatus: string;
  } = {
    payuStatus,
  };

  if (mihpayid) updateData.payuTransactionId = mihpayid;

  if (nextPaymentStatus === "PAID") {
    updateData.paymentStatus = "PAID";
    if (order.orderStatus === "PENDING") {
      updateData.orderStatus = "CONFIRMED";
    }
  } else if (order.paymentStatus !== "PAID") {
    updateData.paymentStatus = nextPaymentStatus;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: updateData,
  });

  if (order.paymentStatus !== updatedOrder.paymentStatus) {
    await createTimelineEvent({
      orderId: order.id,
      eventType: "PAYMENT_STATUS_CHANGED",
      fromValue: order.paymentStatus,
      toValue: updatedOrder.paymentStatus,
      actorType: "PAYU",
      actorId: mihpayid || txnid,
      metadata: { source, payuStatus, txnid },
    });
  }

  if (order.orderStatus !== updatedOrder.orderStatus) {
    await createTimelineEvent({
      orderId: order.id,
      eventType: "ORDER_STATUS_CHANGED",
      fromValue: order.orderStatus,
      toValue: updatedOrder.orderStatus,
      actorType: "PAYU",
      actorId: mihpayid || txnid,
      metadata: { source, payuStatus, txnid },
    });
  }

  if (order.payuStatus !== updatedOrder.payuStatus) {
    await createTimelineEvent({
      orderId: order.id,
      eventType: "PAYU_STATUS_RECORDED",
      fromValue: order.payuStatus,
      toValue: updatedOrder.payuStatus,
      actorType: "PAYU",
      actorId: mihpayid || txnid,
      metadata: { source, txnid },
    });
  }

  if (updatedOrder.paymentStatus === "PAID") {
    const emailResult = await sendOrderConfirmationEmail(updatedOrder.id);
    if (!emailResult.sent && emailResult.reason !== "already_sent") {
      console.warn("Order confirmation email was not sent for txnid:", txnid, emailResult.reason);
    }
  }

  return updatedOrder;
}
