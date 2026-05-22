"use client";

import { useState, useCallback, useRef } from "react";
import { addToCart as addToCartLib } from "@/lib/bags";
import { trackAddToCart } from "@/lib/analytics";

type AddToCartState = "idle" | "adding" | "added";

export function useAddToCart() {
  const [state, setState] = useState<AddToCartState>("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addToCart = useCallback(
    (product: { slug: string; title: string; price: number; images?: string[]; variants?: any[]; category?: string }, options?: { showToast?: boolean; redirect?: boolean }) => {
      // Note: Variants are handled on product page, not in card
      // Products with variants should not appear in collections listing

      // Prevent double taps
      if (state === "adding" || state === "added") return;

      setState("adding");

      // Debounce: clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Add to cart
      addToCartLib(product, 1);

      // Track Add to Cart using GA4 standard
      trackAddToCart(product, 1);

      // Show "Added" state
      setState("added");

      // Open the Cart Drawer (unless explicitly disabled)
      if (options?.showToast !== false) {
        window.dispatchEvent(new CustomEvent("cart:drawer-open"));
      }

      // Reset to idle after 1.5s
      timeoutRef.current = setTimeout(() => {
        setState("idle");
      }, 1500);
    },
    [state]
  );

  return { addToCart, state };
}

