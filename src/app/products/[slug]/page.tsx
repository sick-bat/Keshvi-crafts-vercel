import products from "@/data/products.json";
import ProductPageClient from "@/components/ProductPageClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/types";

type P = any;

// Required for output:'export' on a dynamic route
export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return (products as P[])
    .filter((p) => (p.status ?? "live") !== "hidden" && p.slug)
    .map((p) => ({ slug: String(p.slug) }));
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const p: P | undefined = (products as P[]).find((x) => x.slug === slug);
  if (!p) notFound();

  // Get related products (same category, exclude current)
  const relatedProducts = (products as Product[])
    .filter((prod) => prod.category === p.category && prod.slug !== p.slug && (prod.status ?? "live") !== "hidden")
    .slice(0, 4);

  return (
    <main className="container" style={{ padding: "2rem 0" }}>
      <Link href="/" className="meta" style={{ display: "inline-block", marginBottom: 16, textDecoration: "none" }}>
        ← Back to all products
      </Link>

      <ProductPageClient product={p} relatedProducts={relatedProducts} />
    </main>
  );
}
