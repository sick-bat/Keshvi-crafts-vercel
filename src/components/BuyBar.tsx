
"use client";
import React from "react";

export default function BuyBar({
  slug, title, price, image, checkoutUrl, disabled = false
}: {
  slug: string; title: string; price: number; image?: string;
  checkoutUrl?: string; disabled?: boolean;
}) {
  function addToCart() {
    const key = "cart";
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    const i = arr.findIndex((x: any) => x.slug === slug);
    if (i > -1) arr[i].qty = (arr[i].qty || 1) + 1;
    else arr.push({ slug, title, price, image, qty: 1 });
    localStorage.setItem(key, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent("cart-updated"));
    alert("Added to cart");
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <button className="btn" onClick={addToCart} disabled={disabled}>Add to Cart</button>
      {checkoutUrl && (
        <a className="btn primary" href={checkoutUrl} target="_blank" rel="noopener noreferrer">
          Buy Now
        </a>
      )}
    </div>
  );
}
