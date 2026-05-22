"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCart, updateQty, removeFromCart } from "@/lib/bags";
import { trackRemoveFromCart } from "@/lib/analytics";
import products from "@/data/products.json";

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const refreshCart = useCallback(() => {
    setItems(getCart());
  }, []);

  // Listen for open event + cart changes
  useEffect(() => {
    const handleOpen = () => {
      refreshCart();
      setIsOpen(true);
    };

    const handleCartChange = () => {
      refreshCart();
    };

    window.addEventListener("cart:drawer-open", handleOpen);
    window.addEventListener("bag:changed", handleCartChange);
    window.addEventListener("storage", handleCartChange);

    return () => {
      window.removeEventListener("cart:drawer-open", handleOpen);
      window.removeEventListener("bag:changed", handleCartChange);
      window.removeEventListener("storage", handleCartChange);
    };
  }, [refreshCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const itemCount = items.reduce((n, it) => n + it.qty, 0);

  const handleCheckout = () => {
    close();
    router.push("/checkout");
  };

  const handleRemove = (item: any) => {
    trackRemoveFromCart(item, item.qty);
    removeFromCart(item.slug);
  };

  const handleQtyChange = (item: any, newQty: number) => {
    if (newQty < 1) {
      handleRemove(item);
    } else {
      updateQty(item.slug, newQty);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-drawer-backdrop ${isOpen ? "open" : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`cart-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal={isOpen}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            Your Cart
            {itemCount > 0 && (
              <span className="cart-drawer-count">{itemCount}</span>
            )}
          </div>
          <button
            className="cart-drawer-close"
            onClick={close}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="cart-drawer-items">
          {items.length === 0 ? (
            <div className="cart-drawer-empty">
              <div className="cart-drawer-empty-icon">🧶</div>
              <h3>Your cart is empty</h3>
              <p>Discover our handcrafted pieces and find something you love.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.slug} className="cart-drawer-item">
                <div className="cart-drawer-item-image">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.title}
                    fill
                    sizes="64px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="cart-drawer-item-info">
                  <div>
                    <p className="cart-drawer-item-title">{item.title}</p>
                    <div className="cart-drawer-item-price">
                      ₹{item.price * item.qty}
                    </div>
                  </div>
                  <div className="cart-drawer-item-controls">
                    <div className="cart-drawer-qty">
                      <button
                        onClick={() => handleQtyChange(item, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => handleQtyChange(item, item.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="cart-drawer-remove"
                      onClick={() => handleRemove(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            
            {/* Discount Progress Bar */}
            <div className="cart-drawer-rewards">
              <div className="cart-drawer-rewards-text">
                {(() => {
                  const discountableSubtotal = items.reduce((s, it) => {
                    const p = (products as any[]).find((x) => x.slug === it.slug || x.slug === it.productSlug);
                    if (p?.type === "custom-order") return s;
                    return s + it.price * it.qty;
                  }, 0);
                  
                  if (discountableSubtotal >= 1800) return "🎉 20% Off & Free Shipping Unlocked!";
                  if (discountableSubtotal >= 1250) return `Add ₹${1800 - discountableSubtotal} more for 20% Off`;
                  if (subtotal >= 650) return `Add ₹${1250 - discountableSubtotal} more for 10% Off`;
                  return `Add ₹${650 - subtotal} more for Free Shipping`;
                })()}
              </div>
              <div className="cart-drawer-rewards-bar">
                {(() => {
                  const discountableSubtotal = items.reduce((s, it) => {
                    const p = (products as any[]).find((x) => x.slug === it.slug || x.slug === it.productSlug);
                    if (p?.type === "custom-order") return s;
                    return s + it.price * it.qty;
                  }, 0);
                  
                  let progress = 0;
                  if (discountableSubtotal >= 1800) progress = 100;
                  else if (discountableSubtotal >= 1250) progress = (discountableSubtotal / 1800) * 100;
                  else if (subtotal >= 650) progress = (discountableSubtotal / 1250) * 100;
                  else progress = (subtotal / 650) * 100;
                  
                  return (
                    <div 
                      className="cart-drawer-rewards-progress" 
                      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                  );
                })()}
              </div>
            </div>

            <div className="cart-drawer-subtotal">
              <span className="cart-drawer-subtotal-label">Subtotal</span>
              <span className="cart-drawer-subtotal-value">₹{subtotal}</span>
            </div>
            <button
              className="cart-drawer-checkout-btn"
              onClick={handleCheckout}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Checkout
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ marginLeft: 2 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <div className="cart-drawer-secure">
              🔒 Payments securely processed by PayU
            </div>
          </div>
        )}
      </div>
    </>
  );
}
