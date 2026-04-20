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
import styles from "./ProductCard.module.css";

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
      const message = encodeURIComponent(`Hi! I'm interested in ${p.title}`);
      const url = p.cta?.url || `https://ig.me/m/keshvi_crafts`;
      window.open(url, "_blank", "noopener,noreferrer");
      trackEvent({
        action: "click_instagram_enquiry",
        category: "Card",
        label: p.title,
        location: "card",
        slug: p.slug
      });
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

  const visibleBadges = badges.slice(0, 2);

  // Badge mapping logic
  const renderBadges = () => {
    // Special out of stock
    if (!inStock && !isCustomOrder) {
      return <span className={`${styles['product-badge']} ${styles['badge-neutral']}`}>Out of Stock</span>;
    }
    // Specific Custom Order badge mapping
    if (isCustomOrder && !badges.includes("Made to Order")) {
      return <span className={`${styles['product-badge']} ${styles['badge-clay']}`}>Made to Order</span>;
    }
    
    // Original badges
    if (visibleBadges.length > 0) {
      return visibleBadges.map(b => {
        const badgeClass = b.toLowerCase() === "bestseller" || b.toLowerCase() === "trending" 
          ? styles['badge-clay'] 
          : styles['badge-green'];
        return (
          <span key={b} className={`${styles['product-badge']} ${badgeClass}`}>
            {b}
          </span>
        );
      });
    }
    return null;
  };

  return (
    <article className={`${styles['product-card']} plp-card-mobile`}>
      <div className={`relative w-full bg-[#f4eee7] overflow-hidden`}>
        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-[10] pointer-events-none max-w-[80%]">
          {renderBadges()}
        </div>

        {/* Global wishlisted button Top Right - Wrapped in plp-card to inherit globals.css */}
        <div className="plp-card absolute top-3 right-3 z-[15]">
          <button
            onClick={onHeartClick}
            className={`heart-container ${hearted ? "wishlisted" : ""}`}
            aria-label={hearted ? "Remove from wishlist" : "Add to wishlist"}
            type="button"
            title={hearted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <div className="svg-container">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="var(--heart-color, #a0401b)" className="svg-outline">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--heart-color, #a0401b)" className="svg-filled">
                <path fillRule="evenodd" clipRule="evenodd" d="M12.001 21.243c-.414 0-.83-.133-1.177-.4C5.001 16.478 2 12.718 2 8.75 2 6.127 4.083 4.001 6.75 4.001c1.704 0 3.252.988 4.001 2.453.749-1.465 2.297-2.453 4.001-2.453 2.667 0 4.75 2.127 4.75 4.75 0 3.968-3.001 7.728-8.824 12.093-.347.267-.763.4-1.177.4Z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" height="100" width="100" className="svg-celebrate" viewBox="0 0 100 100">
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

        <Link href={`/products/${encoded}`} aria-label={p.title} onClick={handleCardClick} className="block w-full">
            <div className="relative w-full h-0" style={{ paddingBottom: '105%' }}>
                <ImageWithFallback
                  src={p.images?.[0] || '/placeholder.png'}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className={`${styles['product-image']} object-cover duration-500`}
                  draggable={false}
                  loading="lazy"
                />
            </div>
        </Link>
      </div>

      <div className={styles['product-content']}>
        <p className={styles['product-category']}>
          {p.category || 'Handmade Crochet'}
        </p>
        
        <h3 className={styles['product-title']}>
          <Link href={`/products/${encoded}`} onClick={handleCardClick} className="product-title-link">
            {p.title}
          </Link>
        </h3>
        
        <p className={styles['product-note']}>
          {isCustomOrder ? 'Non-refundable (custom made)' : 'Handmade with care'}
        </p>

        <div className={styles['product-footer']}>
          <p className={styles['product-price']}>{priceDisplay}</p>

          <div className={styles['cart-area']}>
            <button 
              className={`${styles['add-btn']} ${isCustomOrder ? styles['enquire-btn'] : ''} ${state === 'added' ? styles['add-btn-added'] : ''}`} 
              type="button"
              onClick={handleAction}
              disabled={(!inStock && !isCustomOrder) || state === "adding" || state === "added"}
            >
              {isCustomOrder ? "Enquire" : state === 'adding' ? 'Adding…' : state === 'added' ? '✓' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
