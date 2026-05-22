import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { formatDeliveryRange } from "@/lib/deliveryEstimate";

export async function GET(_req: Request, { params }: { params: Promise<{ txnid: string }> }) {
  const { txnid } = await params;
  const merchantTransactionId = decodeURIComponent(txnid || "").trim();

  if (!merchantTransactionId || merchantTransactionId.length > 80) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { merchantTransactionId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "PAID") {
    return NextResponse.json({
      id: order.merchantTransactionId,
      status: order.status,
      paid: false,
    });
  }

  return NextResponse.json({
    id: order.merchantTransactionId,
    status: order.status,
    paid: true,
    fullName: order.fullName,
    email: order.email,
    shippingAddress: {
      address: order.address,
      city: order.city,
      pincode: order.pincode,
    },
    estimatedDelivery: formatDeliveryRange(order.createdAt),
    totalAmountPaise: order.totalAmountPaise,
    items: order.items.map((item) => ({
      productTitle: item.productTitle,
      quantity: item.quantity,
      priceAtPurchasePaise: item.priceAtPurchasePaise,
    })),
  });
}
