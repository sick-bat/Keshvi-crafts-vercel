"use client";

import { useState } from "react";
import Gallery from "@/components/Gallery";
import BuyBar from "@/components/BuyBar";
import VariantSelector from "@/components/VariantSelector";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import type { Product, ProductVariant } from "@/types";

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
        <Gallery images={currentImages} alt={product.title} />
        <div>
          {/* Badge */}
          {product.badge && (
            <span className="product-badge" style={{
              display: "inline-block",
              padding: "0.3rem 0.8rem",
              background: product.badge === "Bestseller" ? "#2C1810" : "#BCA37F",
              color: "#fff",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "0.5rem"
            }}>
              {product.badge}
            </span>
          )}

          <h1 style={{ marginTop: 0, fontSize: "2rem", lineHeight: 1.3 }}>{product.title}</h1>

          {/* Price */}
          <div style={{ fontSize: "1.5rem", fontWeight: 700, margin: "1rem 0", color: "var(--brand)" }}>
            ₹{currentPrice}
            {typeof currentStock === "number" && (
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
            <strong style={{ display: "block", marginBottom: "0.3rem" }}>Made to Order</strong>
            <span className="meta" style={{ fontSize: "0.9rem" }}>
              Dispatch in 3–5 business days. Each piece is crafted especially for you.
            </span>
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

          {/* Buy Bar */}
          <div style={{ marginBottom: "1.5rem" }}>
            <BuyBar
              slug={currentSlug}
              title={currentTitle}
              price={currentPrice}
              image={currentImages[0]}
              checkoutUrl={product.checkoutUrl}
              disabled={!inStock}
              productSlug={product.slug}
            />
          </div>

          {/* Trust Reassurance */}
          <div style={{
            padding: "0.8rem",
            background: "rgba(47, 42, 38, 0.05)",
            borderRadius: "8px",
            fontSize: "0.85rem",
            textAlign: "center"
          }}>
            <span className="meta">🔒 Secure payments via Razorpay</span>
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

