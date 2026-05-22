// app/cart/page.tsx
"use client";

import { getCart, updateQty, removeFromCart, clearCart, addToCart } from "@/lib/bags";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import products from "@/data/products.json"; // Import products for lookup
import { calculateShipping } from "@/lib/shipping";
import { showToast } from "@/components/Toast";
import PriceProgressBar from "@/components/PriceProgressBar";
import CartEnquireButton from "@/components/CartEnquireButton";
import type { Product } from "@/types";
import { trackViewCart } from "@/lib/analytics";

export default function CartPage() {
  const [items, setItems] = useState(getCart());
  const [mounted, setMounted] = useState(false);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [tracked, setTracked] = useState(false);

  const refresh = () => setItems(getCart());

  useEffect(() => {
    setMounted(true);
    try {
      setPastOrders(JSON.parse(localStorage.getItem("pastOrders") || "[]"));
    } catch (e) {
      console.warn("Could not parse pastOrders", e);
    }

    // Safety check: Validate items against products.json
    try {
      const currentCart = getCart();
      let removedCount = 0;
      let invalidCount = 0;

      const validItems = currentCart.filter(item => {
        // Try multiple slug matching strategies
        const itemSlug = item.slug;
        const productSlug = (item as any).productSlug;

        // Find matching product
        const p = (products as Product[]).find(x => {
          // Direct match
          if (x.slug === itemSlug || x.slug === productSlug) return true;
          // Variant match (item slug might be product-variant)
          if (itemSlug.startsWith(x.slug + '-')) return true;
          return false;
        });

        if (!p) {
          invalidCount++;
          return false; // Remove invalid items
        }

        if (p.type === 'custom-order') {
          removedCount++;
          return false;
        }

        return true;
      });

      if (invalidCount > 0 || removedCount > 0) {
        try {
          localStorage.setItem("cart:v1", JSON.stringify(validItems));
          setItems(validItems);

          if (removedCount > 0) {
            showToast("Removed custom-order items from cart. Please enquire on Instagram.");
          }
          if (invalidCount > 0) {
            showToast(`Removed ${invalidCount} invalid item(s) from cart.`);
          }
        } catch (e) {
          console.warn("Could not update cart in localStorage:", e);
          // Still update state even if storage fails
          setItems(validItems);
        }
      }
    } catch (e) {
      console.warn("Cart validation error:", e);
    }

    const h = () => refresh();
    window.addEventListener("bag:changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("bag:changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  const itemCount = items.reduce((n, it) => n + it.qty, 0);

  // Enrich items with shipping info for calculation
  const enrichedItems = items.map(it => {
    const p = (products as Product[]).find(x => x.slug === it.slug || x.slug === (it as any).productSlug);
    return { ...it, shippingCharge: p?.shippingCharge };
  });

  // Calculate Discountable Subtotal (exclude custom-order)
  const discountableSubtotal = enrichedItems.reduce((s, it) => {
    // Check if custom order (based on product lookup)
    const p = (products as Product[]).find(x => x.slug === it.slug || x.slug === (it as any).productSlug);
    if (p?.type === "custom-order") return s;
    return s + it.price * it.qty;
  }, 0);

  // Discount Logic
  let discountPercent = 0;
  if (discountableSubtotal > 1800) discountPercent = 20;
  else if (discountableSubtotal > 1250) discountPercent = 10;

  const discountAmount = Math.round((discountableSubtotal * discountPercent) / 100);

  const shipping = calculateShipping(enrichedItems, total);
  const grandTotal = total - discountAmount + shipping;

  useEffect(() => {
    if (mounted && !tracked && items.length > 0) {
      trackViewCart(items, total);
      setTracked(true);
    }
  }, [mounted, tracked, items, total]);

  if (!mounted) return <div className="min-h-[60vh] bg-[#FAF7F2]" />;

  const handleReorder = (orderItems: any[]) => {
    orderItems.forEach(it => {
      addToCart({ ...it, images: [it.image] }, it.qty);
    });
    showToast("Items added back to your cart!");
    refresh();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-24">
      <div className="container py-8">
        {/* 1. Header */}
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-[#2f2a26] font-serif mb-2">
            Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-[#6a6150] italic">
            Each piece is made to order with care
          </p>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#eadfcd]">
            <div className="mb-4 text-4xl">🧶</div>
            <h2 className="text-xl font-semibold mb-2 text-[#2f2a26]">Your cart is empty</h2>
            <p className="text-[#6a6150] mb-6">
              Your cart is waiting for something handmade. Explore best sellers, gifts under ₹499, and made-to-order crochet pieces.
            </p>
            <Link href="/collections" className="btn-primary inline-flex px-8 py-3">
              Browse Best Sellers
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">

            {/* Left Column: Cart Items */}
            <div className="space-y-4">
              {/* Price Progress Bar */}
              <PriceProgressBar subtotal={total} />
              {items.map((it) => {
                // Parse Variant Info
                const parts = it.title.split(" - ");
                const title = parts[0];
                const variant = parts.length > 1 ? parts[1] : null;

                return (
                  <div key={it.slug} className="bg-white p-4 rounded-xl border border-[#eadfcd] flex gap-4 transition-shadow hover:shadow-sm max-w-full">
                    {/* Image */}
                    <div className="relative w-24 h-32 flex-shrink-0 bg-[#f5f5f5] rounded-lg overflow-hidden border border-[#f0e6d6]">
                      <Image
                        src={it.image || "/placeholder.png"}
                        alt={it.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-[#2f2a26] text-lg leading-tight mb-1 cart-item-title">
                            {/* ROBUST LINK FIX: Find matching product by prefix/title */
                              (() => {
                                const pSlug = (it as any).productSlug;
                                const found = (() => {
                                  if (pSlug) return pSlug;
                                  const prefix = (products as any[]).find(p => it.slug.startsWith(p.slug));
                                  if (prefix) return prefix.slug;
                                  const titleMatch = (products as any[]).find(p => p.title === it.title || p.title === it.slug);
                                  if (titleMatch) return titleMatch.slug;
                                  return it.slug.toLowerCase().replace(/\s+/g, '-');
                                })();

                                return (
                                  <Link href={`/products/${found}`} className="product-title-link">
                                    {title}
                                  </Link>
                                );
                              })()
                            }
                          </h3>
                          <div className="font-bold text-[#C2410C]">₹{it.price * it.qty}</div>
                        </div>

                        {variant && (
                          <div className="text-sm text-[#6a6150] mb-1">
                            Variant: <span className="font-medium text-[#2f2a26]">{variant}</span>
                          </div>
                        )}

                        {/* Check type explicitly via lookup in products list (products imported above) */
                          (() => {
                            const pSlug = (it as any).productSlug || it.slug.split('-')[0];
                            const p = (products as Product[]).find(x => x.slug === pSlug || x.slug === it.slug);
                            if (p?.type === 'custom-order') {
                              return (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#fdf2f8] text-[#be185d] text-xs font-medium rounded-md border border-[#fbcfe8]">
                                  Made to order
                                </div>
                              );
                            }
                            return null;
                          })()
                        }
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity */}
                        <div className="flex items-center gap-3 bg-[#f9f5f0] rounded-full px-1 py-1 border border-[#e5e7eb]">
                          <button
                            onClick={() => updateQty(it.slug, Math.max(1, it.qty - 1))}
                            disabled={it.qty <= 1}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white disabled:opacity-30 text-[#2f2a26] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">{it.qty}</span>
                          <button
                            onClick={() => updateQty(it.slug, it.qty + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white text-[#2f2a26] transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(it.slug)}
                          className="text-sm text-[#9ca3af] hover:text-[#ef4444] transition-colors px-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={clearCart}
                className="text-sm text-[#9ca3af] hover:text-[#2f2a26] underline underline-offset-4 decoration-dotted w-full text-center py-2"
              >
                Clear Cart
              </button>
            </div>

            {/* Right Column: Summary & Checkout */}
            <div className="space-y-6">

              {/* Order Summary Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#eadfcd] shadow-sm sticky top-24">
                <h3 className="font-serif text-xl font-bold text-[#2f2a26] mb-4">Order Summary</h3>

                <div className="space-y-3 text-sm text-[#4b5563] mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#2f2a26]">₹{total}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#C2410C]">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-[#0F766E]">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                </div>

                <div className="h-px bg-[#e5e7eb] my-4" />

                <div className="flex justify-between items-end mb-6">
                  <span className="font-semibold text-lg text-[#2f2a26]">Total</span>
                  <span className="font-bold text-2xl text-[#C2410C]">₹{grandTotal}</span>
                </div>

                {/* Secure Checkout Button -> Routed to checkout */}
                <CartEnquireButton
                  className="w-full btn-primary text-base flex items-center justify-center gap-2 text-center"
                  label="Secure Checkout"
                />

                <div className="text-center mt-3 text-[0.9rem] font-medium text-[#4b5563] flex items-center justify-center gap-1.5">
                  🔒 Payments securely processed by PayU
                </div>

                {/* Trust Icons Strip */}
                <div className="mt-4 pt-4 border-t border-[#f3f4f6] grid grid-cols-2 gap-2 text-[10px] text-[#6b7280] text-center">
                  <div className="flex items-center justify-center gap-1.5 bg-[#f9fafb] py-1.5 rounded">
                    <span>✨</span> Handmade
                  </div>
                  <div className="flex items-center justify-center gap-1.5 bg-[#f9fafb] py-1.5 rounded">
                    <span>🇮🇳</span> Pan-India
                  </div>
                  <div className="flex items-center justify-center gap-1.5 bg-[#f9fafb] py-1.5 rounded">
                    <span>🔒</span> Secure
                  </div>
                  <div className="flex items-center justify-center gap-1.5 bg-[#f9fafb] py-1.5 rounded">
                    <span>💬</span> Support
                  </div>
                </div>

              </div>

              {/* Emotional Reinforcement */}
              <div className="bg-[#fffbeb] p-5 rounded-xl border border-[#fef3c7]">
                <h4 className="font-serif font-bold text-[#92400e] mb-2 flex items-center gap-2">
                  <span>💝</span> Why your order is special
                </h4>
                <ul className="text-sm space-y-2 text-[#b45309]">
                  <li className="flex gap-2">
                    <span className="mt-0.5">•</span>
                    <span><strong>Handmade for you:</strong> Not mass produced in a factory.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5">•</span>
                    <span><strong>Crafted with care:</strong> Every stitch is intentional.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* Previous Orders Section */}
        {pastOrders.length > 0 && (
          <div className="mt-16 border-t border-[#eadfcd] pt-12">
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-[#2f2a26] font-serif mb-2">Previous Orders</h2>
              <p className="text-[#6a6150] italic">Reorder your favorite pieces with ease</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastOrders.map((order, idx) => (
                <div key={order.id || idx} className="bg-white rounded-xl border border-[#eadfcd] p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4 border-b border-[#f3f4f6] pb-4">
                    <div>
                      <div className="text-xs font-medium text-[#C2410C] mb-1">{new Date(order.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                      <div className="text-sm font-semibold text-[#2f2a26]">{order.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#2f2a26]">₹{order.total}</div>
                      <div className="text-xs font-medium text-[#0F766E] bg-[#f0fdf4] px-2 py-0.5 rounded-full inline-block mt-1">
                        {order.status || "Processing"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    {order.items?.map((it: any, i: number) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="relative w-12 h-16 bg-[#f5f5f5] rounded overflow-hidden border border-[#f0e6d6] flex-shrink-0">
                          <Image src={it.image || "/placeholder.png"} alt={it.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                          <span className="font-medium text-[#2f2a26] block truncate">{it.title}</span>
                          <span className="text-[#6a6150] text-xs">Qty: {it.qty}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleReorder(order.items)}
                    className="w-full btn-luxe py-2 text-sm text-center"
                  >
                    Reorder All Items
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
