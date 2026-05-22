// app/wishlist/page.tsx
"use client";

import { getWishlist, removeFromWishlist, addToCart } from "@/lib/bags";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import products from "@/data/products.json";


export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = () => setItems(getWishlist());

  useEffect(() => {
    setMounted(true);
    refresh();
    const h = () => refresh();
    window.addEventListener("bag:changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("bag:changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="container py-4">
        <h1 className="font-serif text-3xl font-bold text-[#2f2a26]">Wishlist</h1>
        <p className="mt-3">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="font-serif text-3xl font-bold text-[#2f2a26]">Wishlist</h1>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-[#eadfcd] bg-white p-8 text-center">
          <h2 className="font-serif text-2xl font-semibold text-[#2f2a26]">Save handmade pieces you love</h2>
          <p className="mx-auto mt-2 max-w-xl text-[#6a6150]">
            Keep your favorite crochet gifts, decor, and accessories here while you decide.
          </p>
          <Link href="/collections" className="btn-primary mt-6 inline-flex px-8 py-3">
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="plp-grid mt-4">
          {items.map((it) => {
            // ROBUST LINK FIX: Find matching product by multiple strategies
            const pSlug = (it as any).productSlug;
            const foundSlug = (() => {
              if (pSlug) return pSlug;
              // 1. Prefix match (handles "slug-variant")
              const prefix = (products as any[]).find(p => it.slug.startsWith(p.slug));
              if (prefix) return prefix.slug;
              // 2. Title match (handles "Title Saved As Slug")
              const titleMatch = (products as any[]).find(p => p.title === it.title || p.title === it.slug);
              if (titleMatch) return titleMatch.slug;
              // 3. Fallback normalization ("Crochet Toran" -> "crochet-toran")
              return it.slug.toLowerCase().replace(/\s+/g, '-');
            })();

            return (
              <ProductCard
                key={it.slug}
                p={{
                  ...it,
                  slug: foundSlug, // Override with correct slug
                  description: "",
                  images: [it.image],
                  variants: []
                } as any}
              />
            )
          })}
        </div>
      )}
    </div>
  );
}
