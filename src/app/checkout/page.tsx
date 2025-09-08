
"use client";

import * as React from "react";
import products from "@/data/products.json";

type Item = { slug:string; title:string; price:number; image?:string; qty?:number };
type P = any;

const productBySlug: Record<string, P> = Object.fromEntries(
  (products as P[]).map((p) => [p.slug, p])
);

export default function CheckoutPage(){
  const [items, setItems] = React.useState<Item[]>([]);

  React.useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("cart") || "[]")); }
    catch { setItems([]); }
  }, []);

  const total = items.reduce((s,i)=> s + (i.price * (i.qty||1)), 0);

  if (!items.length) {
    return (
      <main className="container">
        <h1>Checkout</h1>
        <p className="meta">Your cart is empty.</p>
        <a className="btn" href="/">Back to products</a>
      </main>
    );
  }

  return (
    <main className="container" style={{padding:"1rem 0"}}>
      <h1>Checkout</h1>
      <p className="meta" style={{marginTop:-6}}>
        For now, checkout is per item (Razorpay hosted links). We’ll combine payments in a later iteration.
      </p>

      {items.map((it) => {
        const p = productBySlug[it.slug];
        const img = it.image || p?.images?.[0] || "/placeholder.png";
        const price = p?.price ?? it.price;
        const qty = it.qty || 1;
        const link = p?.checkoutUrl;

        return (
          <div className="card" key={it.slug} style={{display:"flex",alignItems:"center",gap:12,padding:12,margin:"8px 0",flexWrap:"wrap"}}>
            <img src={img} width={64} height={64} alt={it.title} />
            <div style={{flex:1,minWidth:220}}>
              <div style={{fontWeight:600}}>{it.title}</div>
              <div className="meta">Qty: {qty} • ₹{price} each</div>
            </div>
            {link ? (
              <a className="btn primary" href={link} target="_blank" rel="noopener noreferrer">Pay</a>
            ) : (
              <span className="meta">No payment link set</span>
            )}
          </div>
        );
      })}

      <div className="card" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,marginTop:8,flexWrap:"wrap",gap:8}}>
        <div className="price">Cart Total (sum of items): ₹{total}</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <a className="btn" href="/cart">Back to Cart</a>
          <a className="btn" href="/">Continue Shopping</a>
        </div>
      </div>
    </main>
  );
}
