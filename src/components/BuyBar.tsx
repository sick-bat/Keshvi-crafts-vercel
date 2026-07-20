"use client";
import React from "react";
import { addToCart } from "@/lib/bags";
import { trackAddToCart, trackBeginCheckout } from "@/lib/analytics";

export default function BuyBar({
  slug, title, price, image, checkoutUrl, disabled = false, productSlug
}: {
  slug: string; title: string; price: number; image?: string;
  checkoutUrl?: string; disabled?: boolean; productSlug: string;
}) {

  function handleAddToCart() {
    const item = { slug, productSlug, title, price, image: image || "/placeholder.png" };
    addToCart(item, 1);

    trackAddToCart(item, 1);

    // Open the Cart Drawer
    window.dispatchEvent(new CustomEvent("cart:drawer-open"));
  }

  function buyNow() {
    const item = { slug, productSlug, title, price, image: image || "/placeholder.png" };
    addToCart(item, 1);

    trackBeginCheckout([item], price);

    // Open the Cart Drawer for review before checkout
    window.dispatchEvent(new CustomEvent("cart:drawer-open"));
  }

  return (
    <div className="buy-bar">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "0.8rem" }}>
        <button
          className="btn-primary"
          onClick={buyNow}
          disabled={disabled}
          style={{ flex: "1 1 auto", minWidth: "140px" }}
        >
          Buy Now
        </button>
        <button
          className="btn-secondary"
          onClick={handleAddToCart}
          disabled={disabled}
          data-cart-btn={slug}
          style={{ flex: "1 1 auto", minWidth: "140px" }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
