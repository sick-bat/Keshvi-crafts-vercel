import products from "@/data/products.json";
import Gallery from "@/components/Gallery";
import BuyBar from "@/components/BuyBar";
import { notFound } from "next/navigation";

type P = any;

// Required for output:'export' on a dynamic route
export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return (products as P[])
    .filter((p) => (p.status ?? "live") !== "hidden" && p.slug)
    .map((p) => ({ slug: String(p.slug) }));
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);       // <— important
  const p: P | undefined = (products as P[]).find((x) => x.slug === slug);
  if (!p) notFound();

  const imgs: string[] = p.images?.length ? p.images : ["/placeholder.png"];
  const inStock = typeof p.stock === "number" ? p.stock > 0 : true;

  return (
    <main className="container" style={{ padding: "1rem 0" }}>
      <a href="/" className="meta" style={{ display: "inline-block", marginBottom: 12 }}>
        ← Back to all products
      </a>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        <Gallery images={imgs} alt={p.title} />
        <div>
          <h1 style={{ marginTop: 0 }}>{p.title}</h1>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0.5rem 0" }}>
            ₹{p.price}
            {typeof p.stock === "number" && (
              <span className="meta" style={{ marginLeft: 10 }}>
                {inStock ? `${p.stock} in stock` : "Out of stock"}
              </span>
            )}
          </div>
          <p style={{ opacity: 0.9 }}>{p.description}</p>

          <div style={{ marginTop: "1rem" }}>
            <BuyBar
              slug={p.slug}
              title={p.title}
              price={p.price}
              image={imgs[0]}
              checkoutUrl={p.checkoutUrl}
              disabled={!inStock}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
