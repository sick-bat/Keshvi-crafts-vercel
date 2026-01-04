// components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, MouseEvent } from "react";
import type { Product } from "@/types";
import { toggleWishlist } from "@/lib/bags";
import { useAddToCart } from "@/hooks/useAddToCart";

export default function ProductCard({ p }: { p: Product }) {
  const [hearted, setHearted] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(p.images?.[0] ?? "/placeholder.png");
  const { addToCart, state } = useAddToCart();

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
  const inStock = typeof p.stock === "number" ? p.stock > 0 : true;

  const onHeartClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleWishlist(p);
    setHearted(next);
  };

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(p);
  };

  const handleCardClick = (e: MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest("button")) {
      e.preventDefault();
      return;
    }
  };

  const getButtonText = () => {
    if (state === "adding") return "Adding…";
    if (state === "added") return "Added ✓";
    return "Add to Cart";
  };

  return (
    <article className="plp-card-mobile">
      {/* MEDIA WRAPPER: 4:5 aspect ratio, consistent height */}
      <div className="plp-card-media">
        <Link
          href={`/products/${encoded}`}
          aria-label={p.title}
          className="plp-card-image-link"
          onClick={handleCardClick}
        >
          <Image
            src={imgSrc}
            alt={p.title}
            fill
            className="object-cover"
            sizes="(min-width:768px) 280px, calc(50vw - 24px)"
            onError={() => setImgSrc("/placeholder.png")}
            draggable={false}
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="plp-card-badges">
          {p.badge === "Bestseller" && (
            <span className="plp-badge plp-badge-bestseller">Best seller</span>
          )}
          {inStock ? (
            <span className="plp-badge plp-badge-stock">In stock</span>
          ) : (
            <span className="plp-badge plp-badge-out">Out of stock</span>
          )}
        </div>

        {/* Floating wishlist heart */}
        <button
          className={`plp-card-heart ${hearted ? "wishlisted" : ""}`}
          aria-label={hearted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={onHeartClick}
          type="button"
        >
          <svg className="heart-outline" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          <svg className="heart-filled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M12.001 21.243c-.414 0-.83-.133-1.177-.4C5.001 16.478 2 12.718 2 8.75 2 6.127 4.083 4.001 6.75 4.001c1.704 0 
                 3.252.988 4.001 2.453.749-1.465 2.297-2.453 4.001-2.453 2.667 0 4.75 2.127 4.75 4.75 0 3.968-3.001 7.728-8.824 
                 12.093-.347.267-.763.4-1.177.4Z"/>
          </svg>
        </button>
      </div>

      {/* Card Content */}
      <div className="plp-card-content">
        {/* Title + price */}
        <div className="plp-card-header">
          <h3 className="plp-card-title line-clamp-2 h-[2.5em]">
            <Link href={`/products/${encoded}`} onClick={handleCardClick}>
              {p.title}
            </Link>
          </h3>
          <div className="plp-card-price">₹{p.price}</div>
        </div>

        {/* Made to order badge */}
        <div className="plp-card-meta">
          <span className="plp-meta-badge">Made to order</span>
        </div>

        {/* Primary CTA: Full-width on mobile */}
        <button
          type="button"
          className="plp-card-cta"
          onClick={handleAddToCart}
          disabled={!inStock || state === "adding" || state === "added"}
          aria-label={`Add ${p.title} to cart`}
        >
          {getButtonText()}
        </button>
      </div>
    </article>
  );
}
