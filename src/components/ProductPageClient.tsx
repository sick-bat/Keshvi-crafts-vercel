"use client";

import { useState } from "react";
import Gallery from "@/components/Gallery";
import BuyBar from "@/components/BuyBar";
import VariantSelector from "@/components/VariantSelector";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import type { Product, ProductVariant } from "@/types";
import { trackEvent } from "@/lib/analytics";
import { toggleWishlist } from "@/lib/bags";
import { useEffect } from "react";

export default function ProductPageClient({
  product,
  relatedProducts
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const [hearted, setHearted] = useState(false);

  // Initialize wishlist state
  useEffect(() => {
      try {
          const slugs = JSON.parse(localStorage.getItem("wishlist:v1") || "[]") as string[];
          setHearted(slugs.includes(product.slug));
      } catch {}
  }, [product.slug]);

  const onHeartClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setHearted(toggleWishlist(product));
  };

  // Use variant images/price if variant selected, otherwise use product defaults
  const currentImages = selectedVariant?.images || product.images || ["/placeholder.png"];
  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
  const inStock = typeof currentStock === "number" ? currentStock > 0 : true;
  const currentSlug = selectedVariant ? `${product.slug}-${selectedVariant.slug}` : product.slug;
  const currentTitle = selectedVariant ? `${product.title} - ${selectedVariant.name}` : product.title;

  return (
    <>
      <div className="product-page-grid">
        <div className="relative plp-card">
          <Gallery images={currentImages} alt={product.title} />
          
          <button
              onClick={onHeartClick}
              className={`heart-container flex items-center justify-center bg-white/70 backdrop-blur-md rounded-full shadow-md hover:bg-white transition-all active:scale-95 ${hearted ? "wishlisted" : ""}`}
              style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, zIndex: 30 }}
              aria-label={hearted ? "Remove from wishlist" : "Add to wishlist"}
              title={hearted ? "Remove from wishlist" : "Add to wishlist"}
          >
              <div className="svg-container relative flex items-center justify-center w-full h-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="var(--heart-color)" className="svg-outline" style={{width: 24, height: 24}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--heart-color)" className="svg-filled" style={{width: 24, height: 24, position: 'absolute'}}>
                      <path fillRule="evenodd" clipRule="evenodd" d="M12.001 21.243c-.414 0-.83-.133-1.177-.4C5.001 16.478 2 12.718 2 8.75 2 6.127 4.083 4.001 6.75 4.001c1.704 0 3.252.988 4.001 2.453.749-1.465 2.297-2.453 4.001-2.453 2.667 0 4.75 2.127 4.75 4.75 0 3.968-3.001 7.728-8.824 12.093-.347.267-.763.4-1.177.4Z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" height="100" width="100" className="svg-celebrate" viewBox="0 0 100 100" style={{position: 'absolute', width: 38, height: 38}}>
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
        <div>
          {/* Badge */}
          <div className="flex flex-wrap gap-2 mb-3">
            {product.badges && product.badges.length > 0 ? (
              product.badges.map(b => (
                <span key={b} className="product-badge" style={{
                  display: "inline-block",
                  padding: "0.3rem 0.8rem",
                  background: b === "Bestseller" ? "#2C1810" : "#BCA37F",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}>
                  {b}
                </span>
              ))
            ) : product.badge ? (
              <span className="product-badge" style={{
                display: "inline-block",
                padding: "0.3rem 0.8rem",
                background: product.badge === "Bestseller" ? "#2C1810" : "#BCA37F",
                color: "#fff",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}>
                {product.badge}
              </span>
            ) : null}
          </div>

          <h1 style={{ marginTop: 0, fontSize: "2rem", lineHeight: 1.3 }}>{product.title}</h1>

          {/* Price */}
          <div style={{ fontSize: "1.5rem", fontWeight: 700, margin: "1rem 0", color: "var(--brand)" }}>
            {product.type === "custom-order" ? (
              product.priceLabel || `Starts at ₹${product.minPrice || product.price}`
            ) : (
              `₹${currentPrice}`
            )}

            {(typeof currentStock === "number" && product.type !== "custom-order") && (
              <span className="meta" style={{ marginLeft: 12, fontSize: "0.9rem", fontWeight: 400 }}>
                {inStock ? `${currentStock} in stock` : "Out of stock"}
              </span>
            )}
          </div>

          {/* Emotional Description */}
          <p style={{ fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "1.5rem", color: "var(--text)" }}>
            {product.description}
          </p>

          {/* Made to Order Notice */}
          <div style={{
            padding: "1rem",
            background: "rgba(188, 163, 127, 0.1)",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "1px solid rgba(188, 163, 127, 0.2)"
          }}>
            <strong style={{ display: "block", marginBottom: "0.3rem" }}>
              {product.type === "custom-order" ? "Custom Made for You" : "Made to Order"}
            </strong>
            <span className="meta" style={{ fontSize: "0.9rem" }}>
              {product.deliveryTime || "Dispatch in 3–5 business days."} {product.type === "custom-order" ? product.returnPolicy || "Non-refundable." : "Each piece is crafted especially for you."}
            </span>
            {product.shippingCharge !== undefined && (
              <div className="mt-2 text-sm text-stone-600 font-medium">
                Shipping: {product.shippingCharge === 0 ? "Free" : `₹${product.shippingCharge}`}
              </div>
            )}
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <VariantSelector
                variants={product.variants}
                onSelect={setSelectedVariant}
                selectedVariant={selectedVariant}
              />
            </div>
          )}

          {/* Actions: BuyBar or Instagram Enquiry */}
          <div style={{ marginBottom: "1.5rem" }}>
            {product.type === "custom-order" ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    const messageText = `Hi Keshvi Crafts! I want to enquire about: ${product.title}. Please share availability and delivery time.`;
                    // Copy to clipboard as backup
                    navigator.clipboard.writeText(messageText);

                    // Open Instagram DM Deep Link
                    const encodedMsg = encodeURIComponent(messageText);
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    const url = isMobile
                      ? "https://ig.me/m/keshvi_crafts"
                      : "https://www.instagram.com/direct/new/?username=keshvi_crafts";
                    window.open(url, "_blank", "noopener,noreferrer");

                    // Show toast if available
                    if (typeof window !== 'undefined' && (window as any).showToast) {
                      (window as any).showToast("Opening Instagram... Message copied too!");
                    }
                    trackEvent({
                      action: "click_instagram_enquiry",
                      category: "Ecommerce",
                      label: product.title,
                      location: "pdp_primary",
                      slug: product.slug
                    });
                  }}
                  className="btn-primary w-full text-lg"
                >
                  📸 Enquire on Instagram
                </button>

                <button
                  onClick={() => {
                    const message = product.cta?.prefillMessage || `Hi! I'm interested in ${product.title}`;
                    navigator.clipboard.writeText(message);
                    // Simple toast feedback
                    const btn = document.getElementById("copy-btn");
                    if (btn) {
                      const original = btn.innerText;
                      btn.innerText = "Copied! ✓";
                      setTimeout(() => btn.innerText = original, 2000);
                    }
                  }}
                  id="copy-btn"
                  className="btn-secondary w-full text-sm"
                >
                  📋 Copy Enquiry Message
                </button>

                <p className="text-xs text-center text-stone-500 mt-2">
                  Since this is a custom piece, we take orders personally on Instagram to ensure perfect customization.
                </p>
              </div>
            ) : (
              <BuyBar
                slug={currentSlug}
                title={currentTitle}
                price={currentPrice}
                image={currentImages[0]}
                checkoutUrl={product.checkoutUrl}
                disabled={!inStock}
                productSlug={product.slug}
              />
            )}

          </div>

          {/* Trust Reassurance */}
          <div style={{
            padding: "0.8rem",
            background: "rgba(47, 42, 38, 0.05)",
            borderRadius: "8px",
            fontSize: "0.85rem",
            textAlign: "center"
          }}>
            <span className="meta">
              {product.type === "custom-order" ? "🔒 Secure payment via UPI/Bank Transfer" : "🔒 Secure payments via Razorpay"}
            </span>
          </div>

          {/* Product Details */}
          <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>Product Details</h3>
            <dl style={{ display: "grid", gap: "0.8rem" }}>
              {product.materials && product.materials.length > 0 && (
                <>
                  <dt style={{ fontWeight: 600, color: "var(--muted)" }}>Material:</dt>
                  <dd style={{ margin: 0 }}>{product.materials.join(", ")}</dd>
                </>
              )}
              {(selectedVariant?.dimensions || product.dimensions) && (
                <>
                  <dt style={{ fontWeight: 600, color: "var(--muted)" }}>Size / Dimensions:</dt>
                  <dd style={{ margin: 0 }}>{selectedVariant?.dimensions || product.dimensions}</dd>
                </>
              )}
              {(selectedVariant?.handcraftedHours || product.handcraftedHours) && (
                <>
                  <dt style={{ fontWeight: 600, color: "var(--muted)" }}>Handcrafted Hours:</dt>
                  <dd style={{ margin: 0 }}>{selectedVariant?.handcraftedHours || product.handcraftedHours} hours</dd>
                </>
              )}
              <dt style={{ fontWeight: 600, color: "var(--muted)" }}>Care Instructions:</dt>
              <dd style={{ margin: 0 }}>
                Hand wash gently with mild detergent. Lay flat to dry. Avoid direct sunlight to preserve colors.
              </dd>
            </dl>
          </div>

          {/* SEO Enriched Content */}
          {product.seoContent && (
            <div className="product-seo-content" style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border)", lineHeight: 1.8 }}>
              {product.seoContent.intro && <p style={{ marginBottom: "1.5rem" }}>{product.seoContent.intro}</p>}

              {product.seoContent.materials && (
                <>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.8rem", color: "var(--brand)" }}>Materials Used</h3>
                  <p style={{ marginBottom: "1.5rem" }}>{product.seoContent.materials}</p>
                </>
              )}

              {product.seoContent.craftsmanship && (
                <>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.8rem", color: "var(--brand)" }}>Craftsmanship Details</h3>
                  <p style={{ marginBottom: "1.5rem" }}>{product.seoContent.craftsmanship}</p>
                </>
              )}

              {product.seoContent.useCases && (
                <>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.8rem", color: "var(--brand)" }}>Use Cases</h3>
                  <p style={{ marginBottom: "1.5rem" }}>{product.seoContent.useCases}</p>
                </>
              )}

              {product.seoContent.care && (
                <>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.8rem", color: "var(--brand)" }}>Care Instructions</h3>
                  <p style={{ marginBottom: "1.5rem" }}>{product.seoContent.care}</p>
                </>
              )}

              {product.seoContent.faqs && product.seoContent.faqs.length > 0 && (
                <>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "1rem", color: "var(--brand)" }}>Frequently Asked Questions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {product.seoContent.faqs.map((faq, i) => (
                      <div key={i}>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.4rem" }}>{faq.q}</h4>
                        <p style={{ margin: 0 }}>{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: "4rem", paddingTop: "3rem", borderTop: "2px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "1.5rem" }}>You May Also Like</h2>
          <div className="plp-grid">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.slug} p={prod} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

