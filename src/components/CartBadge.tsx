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
      className="cart-badge"
      style={{
        display: "inline-flex",
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        background: "#C2410C",
        color: "#fff",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: "20px",
        padding: "0 5px",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 4,
        pointerEvents: "none",
        verticalAlign: "middle",
        position: "relative",
        top: "-1px"
      }}
    >
      {n}
    </span>
  );
}
