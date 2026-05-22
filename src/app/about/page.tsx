import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Keshvi Crafts',
  description: 'Our story, our mission, and our passion for handmade crochet in India.',
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f3ead8] to-[#FAF7F2] opacity-50 z-0"></div>
        <div className="container relative z-10">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-[#2f2a26]">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl text-[#6a6150] max-w-2xl mx-auto italic font-serif">
            A labor of love, bringing traditional craftsmanship into the modern home.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container max-w-4xl mx-auto py-16 px-4">
        
        {/* Founder Note */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-[#eadfcd] mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#f0e6d6] to-transparent opacity-30 rounded-bl-full"></div>
          <h2 className="font-serif text-3xl font-bold mb-6 text-[#2f2a26] flex items-center gap-3">
            <span>✨</span> The Journey
          </h2>
          <div className="prose prose-lg text-[#4b5563]">
            <p className="leading-relaxed">
              Welcome to Keshvi Crafts, a brand founded by <strong>Vaishnavi Sharma</strong>. Born out of a deep appreciation for the timeless art of crochet, our brand is dedicated to preserving traditional Indian artistry. What started as a passion project has blossomed into a small business where every loop, knot, and pattern tells a story of dedication and creativity.
            </p>
          </div>
        </div>

        {/* Why Choose Us Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#fcfaf7] p-8 rounded-2xl border border-[#eadfcd] hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🧶</div>
            <h3 className="font-serif text-xl font-bold text-[#2f2a26] mb-3">Slow Fashion</h3>
            <p className="text-[#6a6150] leading-relaxed">
              In a world of mass-produced goods, we take pride in the fact that our products are entirely handcrafted. From delicate crochet roses to charming accessories, every single piece is made to order.
            </p>
          </div>
          
          <div className="bg-[#fcfaf7] p-8 rounded-2xl border border-[#eadfcd] hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">💖</div>
            <h3 className="font-serif text-xl font-bold text-[#2f2a26] mb-3">Unique Touch</h3>
            <p className="text-[#6a6150] leading-relaxed">
              No two items are exactly alike. When you purchase from us, you aren&apos;t just buying a product; you are bringing home a piece that carries the unique, thoughtful touch of the maker.
            </p>
          </div>
        </div>

        {/* Conclusion */}
        <div className="text-center bg-[#2f2a26] text-white py-12 px-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#4a423b] via-[#2f2a26] to-[#1a1714] opacity-80"></div>
          <div className="relative z-10">
            <p className="text-xl md:text-2xl font-serif italic mb-6">
              &quot;Proudly based in Gorakhpur, Uttar Pradesh, Keshvi Crafts is committed to delivering quality and warmth across India.&quot;
            </p>
            <div className="inline-block bg-white text-[#2f2a26] font-semibold px-6 py-2 rounded-full text-sm">
              Handmade with ❤️ in India
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
