// app/cart/page.tsx
"use client";

import { getCart, updateQty, removeFromCart, clearCart } from "@/lib/bags";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const [items, setItems] = useState(getCart());

  const refresh = () => setItems(getCart());
  useEffect(() => {
    const h = () => refresh();
    window.addEventListener("bag:changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("bag:changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const total = items.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <div className="container py-4">
      <h1>Your Cart</h1>

      {items.length === 0 ? (
        <p className="mt-3">
          Cart is empty.{" "}
          <Link href="/" className="btn-outline">Continue shopping</Link>
        </p>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            {items.map((it) => (
              <div key={it.slug} className="card p-3 flex gap-3 items-center">
                <div style={{position:"relative", width:80, height:80}}>
                  <Image src={it.image} alt={it.title} fill className="object-cover rounded" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{it.title}</div>
                  <div className="meta">₹{it.price}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button className="btn-icon" onClick={() => updateQty(it.slug, Math.max(1, it.qty - 1))}>−</button>
                    <span>{it.qty}</span>
                    <button className="btn-icon" onClick={() => updateQty(it.slug, it.qty + 1)}>+</button>
                    <button className="btn-outline" onClick={() => removeFromCart(it.slug)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-lg font-semibold">Total: ₹{total}</div>
            <div className="flex gap-3">
              <button className="btn-outline" onClick={clearCart}>Clear Cart</button>
              <button className="btn-luxe">Checkout</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
