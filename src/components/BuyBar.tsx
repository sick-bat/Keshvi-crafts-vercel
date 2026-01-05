"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function BuyBar({
  slug, title, price, image, checkoutUrl, disabled = false, productSlug
}: {
  slug: string; title: string; price: number; image?: string;
  checkoutUrl?: string; disabled?: boolean; productSlug: string;
}) {
  const router = useRouter();

  function addToCart() {
    const key = "cart";
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    const i = arr.findIndex((x: any) => x.slug === slug);
    if (i > -1) arr[i].qty = (arr[i].qty || 1) + 1;
    else arr.push({ slug, title, price, image, qty: 1, productSlug }); // Store productSlug
    localStorage.setItem(key, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent("cart-updated"));
    window.dispatchEvent(new CustomEvent("bag:changed"));
    // Show subtle feedback instead of alert
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
    addToCart();
    setTimeout(() => {
      router.push("/cart"); // Redirect to Cart
    }, 300);
  }

  return (
    <div className="buy-bar">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "0.8rem" }}>
        <button
          className="btn-luxe btn-primary"
          onClick={buyNow}
          disabled={disabled}
          style={{ flex: "1 1 auto", minWidth: "140px" }}
        >
          Buy Now
        </button>
        <button
          className="btn-outline"
          onClick={addToCart}
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
