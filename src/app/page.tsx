import products from "@/data/products.json";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/HeroSection";
import Link from "next/link";

export const metadata = {
  title: "Handmade Collections — Keshvi Crafts",
  description: "Limited-run artisanal crochet pieces.",
};

export default function Home() {
  const live = (products as any[]).filter(
    (p: any) => (p.status ?? "live") !== "hidden"
  );

  // Get best sellers (products with "Bestseller" badge, max 4)
  const bestSellers = live
    .filter((p: any) => p.badge === "Bestseller")
    .slice(0, 4);

  // Get unique categories for "Shop by Collection"
  const categories = Array.from(
    new Set(live.map((p: any) => p.category).filter(Boolean))
  ) as string[];

  // Show only 6-8 products on homepage (not all)
  const featuredProducts = live.slice(0, 8);

  return (
    <main>
      {/* Hero Section */}
      <HeroSection />

      <div className="container py-10">
        {/* About / Why Handmade Section */}
        <section className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold mb-4" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Why Handmade?
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
            Every piece at Keshvi Crafts is lovingly handcrafted with attention to detail. 
            We believe in creating thoughtful, one-of-a-kind items that bring warmth and personality 
            to your home. Made to order, each product is crafted especially for you, ensuring quality 
            and care in every stitch.
          </p>
        </section>

        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-semibold" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Best Sellers
              </h2>
              <Link href="/collections" className="meta hover:underline">
                View All →
              </Link>
            </div>
            <div className="plp-grid-mobile">
              {bestSellers.map((p: any) => (
                <ProductCard key={p.slug} p={p} />
              ))}
            </div>
          </section>
        )}

        {/* Shop by Collection Section */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Shop by Collection
            </h2>
            <div className="flex flex-wrap gap-4 mb-8">
              {categories.map((cat) => {
                const categoryProducts = live.filter((p: any) => p.category === cat);
                return (
                  <Link
                    key={cat}
                    href={`/collections?category=${encodeURIComponent(cat)}`}
                    className="collection-chip"
                  >
                    {cat}
                    <span className="meta ml-2">({categoryProducts.length})</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Featured Products Section */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-semibold" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Handmade Collections
            </h2>
            <Link href="/collections" className="meta hover:underline">
              View All →
            </Link>
          </div>
          <p className="meta mb-6">
            Crafted on request • Ships across India
          </p>

          <div className="plp-grid-mobile">
            {featuredProducts.map((p: any) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>

          {live.length > featuredProducts.length && (
            <div className="text-center mt-8">
              <Link href="/collections" className="btn-luxe">
                View All Products ({live.length})
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
