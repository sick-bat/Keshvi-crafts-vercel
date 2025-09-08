// app/collections/page.tsx
"use client";

import { getCollections, removeFromCollection, addToCart } from "@/lib/bags";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function CollectionsPage() {
  const [data, setData] = useState(getCollections());
  const [active, setActive] = useState<string | null>(null);

  const refresh = () => setData(getCollections());

  useEffect(() => {
    const h = () => refresh();
    window.addEventListener("bag:changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("bag:changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const names = Object.keys(data);
  const currentName = active ?? names[0] ?? null;
  const items = useMemo(() => (currentName ? data[currentName] ?? [] : []), [data, currentName]);

  return (
    <div className="container py-4">
      <h1>Collections</h1>

      {names.length === 0 ? (
        <p className="mt-3">No collections yet. Use “+ Collection” on any product.</p>
      ) : (
        <>
          <div className="flex gap-2 mt-3 flex-wrap">
            {names.map((n) => (
              <button
                key={n}
                className={`chip ${n === currentName ? "bg-neutral-100" : ""}`}
                onClick={() => setActive(n)}
              >
                {n} <span className="meta" style={{marginLeft:6}}>({data[n].length})</span>
              </button>
            ))}
          </div>

          <div className="plp-grid mt-4">
            {items.map((it) => (
              <article key={it.slug} className="card p-3">
                <Link href={`/products/${it.slug}`} className="block">
                  <div style={{position:"relative", width:"100%", aspectRatio:"4/5"}}>
                    <Image src={it.image} alt={it.title} fill className="object-cover rounded" />
                  </div>
                </Link>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{it.title}</div>
                    <div className="meta">₹{it.price}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-luxe" onClick={() => addToCart(it, 1)}>Add to Cart</button>
                    {currentName && (
                      <button
                        className="btn-outline"
                        onClick={() => removeFromCollection(currentName, it.slug)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
