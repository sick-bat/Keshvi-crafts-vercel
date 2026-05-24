import { NextResponse } from "next/server";
import { getInvoiceForDownload, renderInvoicePdf } from "@/lib/invoice";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";

  const invoice = await getInvoiceForDownload(invoiceId, token);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found or link expired" }, { status: 404 });
  }

  const pdf = await renderInvoicePdf(invoice);
  const filename = `${invoice.invoiceNumber}.pdf`;
  const body = new Uint8Array(pdf).buffer;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
