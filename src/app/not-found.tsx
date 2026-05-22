import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-[#FAF7F2] px-4 py-20">
      <section className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#a0401b]">
          404
        </p>
        <h1 className="font-serif text-4xl font-bold text-[#2f2a26] md:text-5xl">
          This handmade piece is not here
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[#6a6150]">
          The page may have moved, or the link may be incorrect. Explore our current crochet gifts, decor, and made-to-order pieces.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/collections" className="btn-primary px-8 py-3">
            Shop Handmade Gifts
          </Link>
          <Link href="/" className="btn-outline px-8 py-3">
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
