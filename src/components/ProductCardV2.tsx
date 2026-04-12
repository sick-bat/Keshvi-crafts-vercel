"use client";

import ImageWithFallback from "@/components/ImageWithFallback";
import Link from "next/link";
import { useEffect, useState, MouseEvent } from "react";
import type { Product } from "@/types";
import { toggleWishlist, getCart, updateQty, removeFromCart } from "@/lib/bags";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import "./ProductCardV2.css";


export default function ProductCardV2({ p }: { p: Product }) {
    const [hearted, setHearted] = useState(false);
    const [qtyInCart, setQtyInCart] = useState(0);
    const { addToCart, state } = useAddToCart();
    const router = useRouter();

    useEffect(() => {
        const updateCartQty = () => {
            const cart = getCart();
            const item = cart.find(x => x.slug === p.slug);
            setQtyInCart(item ? item.qty : 0);
        };
        updateCartQty();
        window.addEventListener("bag:changed", updateCartQty);
        return () => window.removeEventListener("bag:changed", updateCartQty);
    }, [p.slug]);

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
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const defaultUrl = isMobile
                ? "https://ig.me/m/keshvi_crafts"
                : "https://www.instagram.com/direct/new/?username=keshvi_crafts";

            const url = p.cta?.url || defaultUrl;
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

    const getButtonLabel = () => {
        if (isCustomOrder) return "Enquire on Instagram";
        if (state === "adding") return "Adding…";
        if (state === "added") return "Added ✓";
        return "Add to Cart";
    };

    const visibleBadges = badges.slice(0, 2);
    const overflowCount = badges.length - 2;

    return (
        <article className="plp-card-mobile plp-card h-full flex flex-col relative group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-shadow duration-300">

            {/* MEDIA WRAPPER - Relative container for Image + Badges + Heart */}
            <div className="relative w-full bg-stone-100 overflow-hidden">

                <Link
                    href={`/products/${encoded}`}
                    aria-label={p.title}
                    className="block w-full h-full"
                    onClick={handleCardClick}
                >
                    {/* Aspect Ratio Container */}
                    <div className="relative w-full h-0" style={{ paddingBottom: '100%' }}>
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

                {/* Wishlist Button - Using globals.css styles */}
                <button
                    onClick={onHeartClick}
                    className={`heart-container ${hearted ? "wishlisted" : ""}`}
                    aria-label={hearted ? "Remove from wishlist" : "Add to wishlist"}
                    type="button"
                    title={hearted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <div className="svg-container">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="var(--heart-color)" className="svg-outline">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--heart-color)" className="svg-filled">
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

                {/* Badges - Top Left */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10 pointer-events-none max-w-[80%]">
                    {!inStock && !isCustomOrder && (
                        <span className="px-2 py-1 text-[10px] font-bold bg-neutral-900 text-white rounded shadow-sm">Out of Stock</span>
                    )}
                    {isCustomOrder && !badges.includes("Made to Order") && (
                        <span className="px-2 py-1 text-[10px] font-semibold bg-[#C2410C] text-white backdrop-blur-sm rounded shadow-sm">
                            Made to Order
                        </span>
                    )}
                    {visibleBadges.map(b => (
                        <span key={b} className={`px-2 py-1 text-[10px] font-semibold backdrop-blur-sm rounded shadow-sm border ${b === "Bestseller"
                            ? "bg-[#2C1810] text-white border-[#2C1810]"
                            : "bg-white/90 text-neutral-800 border-neutral-100"
                            }`}>
                            {b}
                        </span>
                    ))}
                    {overflowCount > 0 && (
                        <span className="px-2 py-1 text-[10px] font-semibold bg-white/90 text-neutral-600 backdrop-blur-sm rounded shadow-sm border border-neutral-100">
                            +{overflowCount}
                        </span>
                    )}
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex flex-col flex-grow p-4">
                <h3 className="text-base font-medium text-neutral-900 leading-snug mb-2 line-clamp-2 min-h-[2.5em]">
                    <Link href={`/products/${encoded}`} onClick={handleCardClick} className="product-title-link">
                        {p.title}
                    </Link>
                </h3>

                <div className="mt-auto">
                    {isCustomOrder && (
                        <p className="text-[11px] text-stone-500 mb-2 font-medium">Non-refundable (custom made)</p>
                    )}

                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold text-neutral-900">{priceDisplay}</span>
                    </div>

                    {isCustomOrder ? (
                        <button
                            type="button"
                            onClick={handleAction}
                            disabled={!isCustomOrder}
                            className="w-full btn-secondary"
                        >
                            {getButtonLabel()}
                        </button>
                    ) : qtyInCart > 0 ? (
                        <div className="inline-counter-container">
                            <button
                                className="inline-counter-btn"
                                aria-label="Decrease quantity"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (qtyInCart > 1) {
                                        updateQty(p.slug, qtyInCart - 1);
                                    } else {
                                        removeFromCart(p.slug);
                                    }
                                }}
                            >
                                &minus;
                            </button>
                            <div className="inline-counter-value" aria-live="polite">
                                {qtyInCart}
                            </div>
                            <button
                                className="inline-counter-btn"
                                aria-label="Increase quantity"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (typeof p.stock !== 'number' || qtyInCart < p.stock) {
                                        updateQty(p.slug, qtyInCart + 1);
                                    }
                                }}
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAction}
                            disabled={!inStock || state === "adding" || state === "added"}
                            className="w-full btn-primary"
                        >
                            {getButtonLabel()}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
