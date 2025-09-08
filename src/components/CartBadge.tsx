// components/CartBadge.tsx
"use client";

import { cartCount } from "@/lib/bags";
import { useEffect, useState } from "react";

export default function CartBadge() {
  const [n, setN] = useState(0);

  const refresh = () => setN(cartCount());

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("bag:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("bag:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  if (!n) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        background: "#111",
        color: "#fff",
        fontSize: 12,
        lineHeight: "18px",
        padding: "0 6px",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 6
      }}
    >
      {n}
    </span>
  );
}
