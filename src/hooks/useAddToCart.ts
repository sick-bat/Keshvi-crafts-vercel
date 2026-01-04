"use client";

import { useState, useCallback, useRef } from "react";
import { addToCart as addToCartLib } from "@/lib/bags";
import { showToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

type AddToCartState = "idle" | "adding" | "added";

export function useAddToCart() {
  const [state, setState] = useState<AddToCartState>("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const addToCart = useCallback(
    (product: { slug: string; title: string; price: number; images?: string[]; variants?: any[] }, options?: { showToast?: boolean; redirect?: boolean }) => {
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

      // Show "Added" state
      setState("added");
      
      // Show toast if requested (default true)
      if (options?.showToast !== false) {
        showToast("Added to cart", {
          label: "View cart",
          onClick: () => router.push("/cart"),
        });
      }

      // Reset to idle after 1.5s
      timeoutRef.current = setTimeout(() => {
        setState("idle");
      }, 1500);
    },
    [state, router]
  );

  return { addToCart, state };
}

