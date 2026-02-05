// components/ProductCard.tsx
"use client";

import ImageWithFallback from "@/components/ImageWithFallback";
import Link from "next/link";
import { useEffect, useState, MouseEvent } from "react";
import type { Product } from "@/types";
import { toggleWishlist } from "@/lib/bags";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function ProductCard({ p }: { p: Product }) {
  const [hearted, setHearted] = useState(false);
  const { addToCart, state } = useAddToCart();
  const router = useRouter();

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
  const isCustomOrder = p.type === "custom-order";

  // Resolve badges: prioritize array, fallback to single string, or compute from logic
  const badges = p.badges && p.badges.length > 0 ? p.badges : (p.badge ? [p.badge] : []);

  // Resolve price display
  const priceDisplay = isCustomOrder
    ? (p.priceLabel || `Starts at ₹${p.minPrice || p.price}`)
    : `₹${p.price}`;

  const onHeartClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleWishlist(p);
    setHearted(next);
  };

  const handleAction = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCustomOrder) {
      // Enquire action
      const url = p.cta?.url || "https://instagram.com/keshvicrafts";
      window.open(url, "_blank", "noopener,noreferrer");
      trackEvent("click_instagram_enquiry", { slug: p.slug, location: "card" });
    } else {
      // Add to Cart action
      addToCart(p);
    }
  };

  const handleCardClick = (e: MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest("button")) {
      e.preventDefault();
      return;
    }
  };

  const getButtonLabel = () => {
    if (isCustomOrder) return "Enquire";
    if (state === "adding") return "Adding…";
    if (state === "added") return "Added ✓";
    return "Add to Cart";
  };

  return (
    <article className="plp-card-mobile h-full flex flex-col relative group">
      {/* MEDIA WRAPPER */}
      {/* MEDIA WRAPPER */}
      <div className="relative w-full bg-stone-100 overflow-hidden group rounded-xl mb-3">
        <Link
          href={`/products/${encoded}`}
          aria-label={p.title}
          className="block w-full h-full"
          onClick={handleCardClick}
        >
          <div className="relative w-full h-0" style={{ paddingBottom: '125%' }}>
            <ImageWithFallback
              src={p.images?.[0] || '/placeholder.png'}
              alt={p.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
              draggable={false}
              loading="lazy"
            />
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {!inStock && !isCustomOrder && (
            <span className="px-2 py-0.5 text-xs font-bold bg-neutral-900 text-white rounded">Out of Stock</span>
          )}
          {badges.map(b => (
            <span key={b} className="px-2 py-0.5 text-xs font-semibold bg-white/90 text-neutral-800 backdrop-blur-sm rounded shadow-sm border border-neutral-100">
              {b}
            </span>
          ))}
        </div>

        {/* Wishlist Button */}
        <button
          className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur text-neutral-600 transition-colors z-20 hover:bg-white hover:text-red-500 ${hearted ? "text-red-500 bg-white" : ""}`}
          aria-label={hearted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={onHeartClick}
          type="button"
        >
          {hearted ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          )}
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-grow">
        <h3 className="text-base font-medium text-neutral-900 leading-tight mb-1 line-clamp-2 min-h-[2.5em]">
          <Link href={`/products/${encoded}`} onClick={handleCardClick} className="hover:underline decoration-neutral-300 underline-offset-2">
            {p.title}
          </Link>
        </h3>

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div className="text-lg font-bold text-neutral-900">
            {priceDisplay}
          </div>

          <button
            type="button"
            onClick={handleAction}
            disabled={(!inStock && !isCustomOrder) || state === "adding" || state === "added"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isCustomOrder
              ? "bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200"
              : "bg-[#2C1810] text-[#FAF9F7] hover:bg-[#3a2016] disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
          >
            {getButtonLabel()}
          </button>
        </div>

        {isCustomOrder && (
          <p className="text-[10px] text-stone-500 mt-1 uppercase tracking-wide font-medium">Made to Order</p>
        )}
      </div>
    </article>
  );
}
