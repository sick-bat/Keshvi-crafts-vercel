import products from "@/data/products.json";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/HeroSection"; // 👈 import added

export const metadata = {
  title: "Handmade Collections — Keshvi Crafts",
  description: "Limited-run artisanal crochet pieces.",
};

export default function Home() {
  const live = (products as any[]).filter(
    (p: any) => (p.status ?? "live") !== "hidden"
  );

  return (
    <main>
      {/* 👇 Hero Section goes first */}
      <HeroSection />

      <div className="container py-10">
        <section className="mb-6">
          <h1 className="text-4xl font-semibold">Handmade Collections</h1>
          <p className="meta mt-1">
            Crafted on request • Ships across India
          </p>
        </section>

        <div className="plp-grid">
          {live.map((p: any) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
