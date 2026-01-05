// app/wishlist/page.tsx
"use client";

import { getWishlist, removeFromWishlist, addToCart } from "@/lib/bags";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import products from "@/data/products.json";


export default function WishlistPage() {
  const [items, setItems] = useState(getWishlist());
  const refresh = () => setItems(getWishlist());

  useEffect(() => {
    const h = () => refresh();
    window.addEventListener("bag:changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("bag:changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  return (
    <div className="container py-4">
      <h1>Wishlist</h1>

      {items.length === 0 ? (
        <p className="mt-3">Nothing saved yet. <Link href="/" className="btn-outline">Browse products</Link></p>
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
