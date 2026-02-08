"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/bags";

export default function BuyBar({
  slug, title, price, image, checkoutUrl, disabled = false, productSlug
}: {
  slug: string; title: string; price: number; image?: string;
  checkoutUrl?: string; disabled?: boolean; productSlug: string;
}) {
  const router = useRouter();

  function handleAddToCart() {
    addToCart({ slug, title, price, image: image || "/placeholder.png" }, 1);

    // Show subtle feedback
    const btn = document.querySelector(`[data-cart-btn="${slug}"]`) as HTMLElement;
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = "Added!";
      setTimeout(() => {
        if (btn) btn.textContent = originalText;
      }, 1000);
    }
  }

  function buyNow() {
    addToCart({ slug, title, price, image: image || "/placeholder.png" }, 1);
    setTimeout(() => {
      router.push("/cart"); // Redirect to Cart
    }, 100);
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
