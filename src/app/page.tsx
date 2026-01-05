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

      <div className="container py-40 mt-10">
        {/* About / Why Handmade Section */}
        <section className="mb-12 text-center max-w-3xl mx-auto">
          <br></br>
          <h2 className="text-3xl font-semibold mb-4" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Why Handmade?
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
            Handmade isn’t just about how something is made — it’s about the care behind it.
            Every piece at Keshvi Crafts is created slowly, thoughtfully, and with intention.
            Unlike mass-produced items, handmade crochet carries warmth, individuality, and soul.
          </p>
          <div className="mt-8 text-left max-w-2xl mx-auto space-y-6">
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#fae8d4] text-[#C2410C] flex items-center justify-center font-bold">1</span>
              <div>
                <strong className="block text-[#2f2a26] text-lg mb-1">Made to order, not mass produced</strong>
                <p className="text-[#6a6150] leading-relaxed">Each item is started only after you place an order, reducing waste and ensuring it&apos;s made just for you.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#fae8d4] text-[#C2410C] flex items-center justify-center font-bold">2</span>
              <div>
                <strong className="block text-[#2f2a26] text-lg mb-1">Crafted with care & attention</strong>
                <p className="text-[#6a6150] leading-relaxed">Our artisans spend hours perfecting every stitch, ensuring quality that machines simply can&apos;t match.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#fae8d4] text-[#C2410C] flex items-center justify-center font-bold">3</span>
              <div>
                <strong className="block text-[#2f2a26] text-lg mb-1">Truly unique to you</strong>
                <p className="text-[#6a6150] leading-relaxed">No two handmade pieces are exactly alike. Your item carries individuality, warmth, and soul.</p>
              </div>
            </div>
          </div>
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
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.slice(0, 4).map((cat) => {
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
              <Link href="/collections" className="collection-chip bg-stone-100 border-dashed text-stone-600">
                View All Collections →
              </Link>
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
