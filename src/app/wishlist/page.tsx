// app/wishlist/page.tsx
"use client";

import { getWishlist, removeFromWishlist, addToCart } from "@/lib/bags";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
            <article key={it.slug} className="card p-3">
              <Link href={`/products/${it.slug}`} className="block">
                <div style={{position:"relative", width:"100%", aspectRatio:"4/5"}}>
                  <Image src={it.image} alt={it.title} fill className="object-cover rounded" />
                </div>
              </Link>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.title}</div>
                  <div className="meta">₹{it.price}</div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-luxe" onClick={() => addToCart(it, 1)}>Add to Cart</button>
                  <button className="btn-outline" onClick={() => removeFromWishlist(it.slug)}>Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
