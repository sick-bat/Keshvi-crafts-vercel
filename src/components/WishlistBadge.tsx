"use client";
import { useEffect, useState } from "react";

function getCount(): number {
  try {
    const wl = JSON.parse(localStorage.getItem("wishlist") || "[]") as string[];
    return wl.length;
  } catch { return 0; }
}

export default function WishlistBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(getCount());
    update();
    const onStorage = (e: StorageEvent) => { if (e.key === "wishlist") update(); };

    window.addEventListener("wishlist:update", update);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("wishlist:update", update);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <span className="badge-label">
      Wishlist
      {count > 0 && <span className="pill">{count}</span>}
    </span>
  );
}
