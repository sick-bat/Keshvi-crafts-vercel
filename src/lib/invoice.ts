import crypto from "crypto";
import PDFDocument from "pdfkit";
import prisma from "@/lib/prisma";

type InvoiceOrder = {
  id: string;
  merchantTransactionId: string | null;
  payuTransactionId: string | null;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  fullName: string;
  phoneNumber: string;
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

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function formatInr(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(paise / 100));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://www.keshvicrafts.in").replace(/\/$/, "");
}

function sellerDetails() {
  return {
    legalName: process.env.INVOICE_SELLER_LEGAL_NAME || "Vaishnavi Sharma",
    tradeName: process.env.INVOICE_SELLER_TRADE_NAME || "Keshvi Crafts",
    type: process.env.INVOICE_SELLER_TYPE || "Sole Proprietorship",
    address:
      process.env.INVOICE_SELLER_ADDRESS ||
      "167 L, In Front of Indane Gas Godam, New Colony, Madhopur, Surajkund, Gorakhpur, Uttar Pradesh - 273015",
    email: process.env.INVOICE_SELLER_EMAIL || "keshvicrafts@gmail.com",
    phone: process.env.INVOICE_SELLER_PHONE || "+91 7310045515",
    website: process.env.INVOICE_SELLER_WEBSITE || "www.keshvicrafts.in",
    founderName: process.env.INVOICE_FOUNDER_NAME || "Vaishnavi",
  };
}

function makeInvoiceNumber(order: { id: string; createdAt: Date }) {
  const year = order.createdAt.getFullYear();
  return `KC-${year}-${order.id.slice(-8).toUpperCase()}`;
}

export async function ensureInvoiceDownloadLink(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, createdAt: true, paymentStatus: true },
  });

  if (!order || order.paymentStatus !== "PAID") return null;

  const token = crypto.randomBytes(32).toString("base64url");
  const downloadTokenHash = hashToken(token);
  const invoiceNumber = makeInvoiceNumber(order);

  const invoice = await prisma.invoice.upsert({
    where: { orderId },
    create: {
      orderId,
      invoiceNumber,
      downloadTokenHash,
      emailLinkedAt: new Date(),
    },
    update: {
      downloadTokenHash,
      emailLinkedAt: new Date(),
    },
  });

  return {
    invoice,
    token,
    url: `${getBaseUrl()}/api/invoices/${encodeURIComponent(invoice.id)}/download?token=${encodeURIComponent(token)}`,
  };
}

export async function getInvoiceForDownload(invoiceId: string, token: string) {
  if (!invoiceId || !token) return null;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: {
        include: { items: true },
      },
    },
  });

  if (!invoice || invoice.downloadTokenHash !== hashToken(token)) return null;
  if (invoice.order.paymentStatus !== "PAID") return null;

  return invoice;
}

function addKeyValue(doc: PDFKit.PDFDocument, key: string, value: string, x: number, y: number, width = 220) {
  doc.fillColor("#7a6255").fontSize(8).font("Helvetica-Bold").text(key.toUpperCase(), x, y, { width });
  doc.fillColor("#3b2a22").fontSize(10).font("Helvetica").text(value || "-", x, y + 13, { width });
}

export async function renderInvoicePdf(invoice: {
  invoiceNumber: string;
  createdAt: Date;
  order: InvoiceOrder;
}) {
  const seller = sellerDetails();
  const order = invoice.order;
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#fff8f1");
  doc.fillColor("#8b5e3c").font("Helvetica-Bold").fontSize(24).text(seller.tradeName.toUpperCase(), 40, 40);
  doc.fillColor("#7a6255").font("Helvetica").fontSize(9).text("Handmade with love | Crochet | Custom Gifts", 40, 70);
  doc.text(`${seller.legalName} | ${seller.type}`, 40, 88);
  doc.text(seller.address, 40, 102, { width: 285 });
  doc.text(`Email: ${seller.email} | Phone: ${seller.phone}`, 40, 130);
  doc.text(`Website: ${seller.website}`, 40, 144);

  doc.fillColor("#3b2a22").font("Helvetica-Bold").fontSize(26).text("INVOICE", 410, 42, { align: "right" });
  doc.roundedRect(450, 80, 100, 24, 12).fill("#e8f6ed");
  doc.fillColor("#2e7d32").fontSize(9).text("PAYMENT PAID", 464, 88);

  doc.moveTo(40, 175).lineTo(555, 175).strokeColor("#ead8c8").lineWidth(1).stroke();

  addKeyValue(doc, "Invoice No", invoice.invoiceNumber, 40, 195);
  addKeyValue(doc, "Order ID", order.merchantTransactionId || order.id, 200, 195);
  addKeyValue(doc, "Invoice Date", formatDate(invoice.createdAt), 390, 195);
  addKeyValue(doc, "Order Status", order.orderStatus, 40, 240);
  addKeyValue(doc, "Payment Method", order.paymentMethod, 200, 240);
  addKeyValue(doc, "Payment Status", order.paymentStatus, 390, 240);

  doc.fillColor("#3b2a22").font("Helvetica-Bold").fontSize(12).text("Bill To", 40, 300);
  doc.fillColor("#3b2a22").font("Helvetica").fontSize(10).text(order.fullName, 40, 320);
  doc.text(`Phone: ${order.phoneNumber}`, 40, 336);
  if (order.email) doc.text(`Email: ${order.email}`, 40, 352);

  doc.fillColor("#3b2a22").font("Helvetica-Bold").fontSize(12).text("Shipping Address", 315, 300);
  doc.fillColor("#3b2a22").font("Helvetica").fontSize(10).text(`${order.address}, ${order.city} - ${order.pincode}`, 315, 320, { width: 230 });

  const tableTop = 400;
  doc.roundedRect(40, tableTop, 515, 28, 8).fill("#fff1ea");
  doc.fillColor("#3b2a22").font("Helvetica-Bold").fontSize(9);
  doc.text("Item", 52, tableTop + 10, { width: 250 });
  doc.text("Qty", 320, tableTop + 10, { width: 45, align: "center" });
  doc.text("Unit Price", 380, tableTop + 10, { width: 75, align: "right" });
  doc.text("Total", 470, tableTop + 10, { width: 70, align: "right" });

  let y = tableTop + 42;
  order.items.forEach((item) => {
    const lineTotal = item.priceAtPurchasePaise * item.quantity;
    doc.fillColor("#3b2a22").font("Helvetica").fontSize(9);
    doc.text(item.productTitle, 52, y, { width: 250 });
    doc.text(String(item.quantity), 320, y, { width: 45, align: "center" });
    doc.text(formatInr(item.priceAtPurchasePaise), 380, y, { width: 75, align: "right" });
    doc.text(formatInr(lineTotal), 470, y, { width: 70, align: "right" });
    y += 28;
  });

  const itemsSubtotal = order.items.reduce((sum, item) => sum + item.priceAtPurchasePaise * item.quantity, 0);
  const adjustment = order.totalAmountPaise - itemsSubtotal;
  y = Math.max(y + 20, 540);

  doc.fillColor("#3b2a22").font("Helvetica-Bold").fontSize(12).text("Payment Details", 40, y);
  doc.fillColor("#7a6255").font("Helvetica").fontSize(9).text(`PayU Transaction ID: ${order.payuTransactionId || "-"}`, 40, y + 22);
  doc.text(`Merchant TXN ID: ${order.merchantTransactionId || "-"}`, 40, y + 38);

  doc.fillColor("#3b2a22").font("Helvetica-Bold").fontSize(12).text("Amount Summary", 360, y);
  doc.fillColor("#3b2a22").font("Helvetica").fontSize(10);
  doc.text("Items subtotal", 360, y + 24);
  doc.text(formatInr(itemsSubtotal), 465, y + 24, { width: 80, align: "right" });
  doc.text("Shipping/discount adjustment", 360, y + 42);
  doc.text(formatInr(adjustment), 465, y + 42, { width: 80, align: "right" });
  doc.moveTo(360, y + 66).lineTo(545, y + 66).strokeColor("#ead8c8").stroke();
  doc.font("Helvetica-Bold").fontSize(14).text("Total Paid", 360, y + 78);
  doc.fillColor("#8b5e3c").text(formatInr(order.totalAmountPaise), 455, y + 78, { width: 90, align: "right" });

  doc.fillColor("#3b2a22").font("Helvetica-Bold").fontSize(11).text("A small note from us", 40, 690);
  doc.fillColor("#7a6255").font("Helvetica").fontSize(9).text(
    "Thank you for supporting handmade art. Every Keshvi Crafts product is made with care, patience, and love.",
    40,
    708,
    { width: 310 }
  );

  doc.fillColor("#7a6255").fontSize(9).text("With gratitude,", 405, 690, { align: "right" });
  doc.fillColor("#3b2a22").font("Helvetica-Bold").fontSize(16).text(seller.founderName, 370, 715, { width: 175, align: "right" });
  doc.fillColor("#7a6255").font("Helvetica").fontSize(9).text(`Founder, ${seller.tradeName}`, 370, 736, { width: 175, align: "right" });

  doc.moveTo(40, 775).lineTo(555, 775).strokeColor("#ead8c8").stroke();
  doc.fillColor("#8b5e3c").font("Helvetica-Bold").fontSize(10).text(`Thank you for shopping with ${seller.tradeName}`, 40, 790, { align: "center" });
  doc.fillColor("#7a6255").font("Helvetica").fontSize(8).text(
    `For order support, contact ${seller.email}. Please keep this invoice for your records.`,
    40,
    810,
    { align: "center" }
  );
  doc.text("This is a computer-generated invoice and does not require a physical signature.", 40, 824, { align: "center" });

  doc.end();
  return done;
}
