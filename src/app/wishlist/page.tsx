// app/wishlist/page.tsx
"use client";

import { getWishlist, removeFromWishlist, addToCart } from "@/lib/bags";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

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
          {items.map((it) => (
            <ProductCard
              key={it.slug}
              p={{
                ...it,
                description: "",
                images: [it.image],
                variants: []
              } as any}
            />
          ))}
        </div>
      )}
    </div>
  );
}
