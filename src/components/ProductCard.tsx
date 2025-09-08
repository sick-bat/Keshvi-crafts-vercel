// components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, MouseEvent } from "react";
import type { Product } from "@/types";
import { addToCart, addToCollection, toggleWishlist } from "@/lib/bags";

export default function ProductCard({ p }: { p: Product }) {
  const [hearted, setHearted] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(p.images?.[0] ?? "/placeholder.png");

  // Initialize "hearted" from storage on mount or slug change
  useEffect(() => {
    try {
      const slugs = JSON.parse(localStorage.getItem("wishlist:v1") || "[]") as string[];
      setHearted(slugs.includes(p.slug));
    } catch {
      // ignore
    }
  }, [p.slug]);

  const encoded = encodeURIComponent(p.slug);

  const onHeartClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // toggleWishlist should update storage and return the NEW state
    const next = toggleWishlist(p);
    setHearted(next);
  };

  return (
    <article className="plp-card">
      {/* MEDIA WRAPPER: keep `relative` here so the heart can be absolutely positioned */}
      <div className="media relative">
        <Link href={`/products/${encoded}`} aria-label={p.title} className="block">
          <Image
            src={imgSrc}
            alt={p.title}
            fill
            className="object-cover"
            sizes="(min-width:1280px) 300px, (min-width:768px) 280px, 92vw"
            onError={() => setImgSrc("/placeholder.png")}
            draggable={false}
            priority={false}
          />
        </Link>

        {/* Floating wishlist heart */}
        <button
          className={`heart-container ${hearted ? "wishlisted" : ""}`}
          aria-label={hearted ? "Remove from wishlist" : "Add to wishlist"}
          title={hearted ? "Wishlisted" : "Like"}
          onClick={onHeartClick}
          type="button"
        >
          <div className="svg-container">
            {/* outline heart */}
            <svg className="svg-outline" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/>
            </svg>
            {/* filled heart */}
            <svg className="svg-filled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M12.001 21.243c-.414 0-.83-.133-1.177-.4C5.001 16.478 2 12.718 2 8.75 2 6.127 4.083 4.001 6.75 4.001c1.704 0 
                   3.252.988 4.001 2.453.749-1.465 2.297-2.453 4.001-2.453 2.667 0 4.75 2.127 4.75 4.75 0 3.968-3.001 7.728-8.824 
                   12.093-.347.267-.763.4-1.177.4Z"/>
            </svg>
            {/* confetti */}
            <svg className="svg-celebrate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <polygon points="10,10 20,20"></polygon>
              <polygon points="10,50 20,50"></polygon>
              <polygon points="20,80 30,70"></polygon>
              <polygon points="90,10 80,20"></polygon>
              <polygon points="90,50 80,50"></polygon>
              <polygon points="80,80 70,70"></polygon>
            </svg>
          </div>
        </button>
      </div>

      {/* Title + price */}
      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="lv-title leading-snug">
            <Link href={`/products/${encoded}`} className="hover:underline underline-offset-4">
              {p.title}
            </Link>
          </h3>
          <div className="lv-price">₹{p.price}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-3">
        <button type="button" className="btn-luxe" onClick={() => addToCart(p, 1)}>
          Add to Cart
        </button>
        <button type="button" className="btn-outline" onClick={() => addToCollection(p)}>
          + Collection
        </button>
      </div>
    </article>
  );
}
