"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { clearCart } from "@/lib/bags";
import { trackPurchase } from "@/lib/analytics";

type OrderDetails = {
  id: string;
  status: string;
  paid: boolean;
  fullName?: string;
  email?: string | null;
  shippingAddress?: {
    address: string;
    city: string;
    pincode: string;
  };
  estimatedDelivery?: string;
  totalAmountPaise?: number;
  items?: Array<{
    productTitle: string;
    quantity: number;
    priceAtPurchasePaise: number;
  }>;
};

function formatInr(paise = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(paise / 100));
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const txnid = searchParams.get("txnid");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!txnid) {
      setError("Missing order number. Please contact us if payment was deducted.");
      return;
    }

    const orderId = txnid;
    let cancelled = false;

    async function loadOrder() {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Order lookup failed");
        }

        const order = (await response.json()) as OrderDetails;
        if (cancelled) return;

        setOrderDetails(order);

        if (!order.paid) {
          setError("Payment is still being verified. If money was deducted, please contact us with this order number.");
          return;
        }

        clearCart();
        setTimeout(() => setAnimate(true), 100);

        const duration = 3 * 1000;
        const end = Date.now() + duration;
        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#C2410C", "#0F766E", "#FBBF24"],
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#C2410C", "#0F766E", "#FBBF24"],
          });

          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();

        if (!window.sessionStorage.getItem(`tracked_${orderId}`)) {
          trackPurchase(
            orderId,
            (order.totalAmountPaise || 0) / 100,
            (order.items || []).map((item) => ({
              slug: (item as any).slug || (item as any).productSlug || item.productTitle.toLowerCase().replace(/[^\w-]+/g, "-"),
              title: item.productTitle,
              price: item.priceAtPurchasePaise / 100,
              qty: item.quantity,
            }))
          );
          window.sessionStorage.setItem(`tracked_${orderId}`, "true");
        }
      } catch {
        if (!cancelled) {
          setError("We could not load your order details. Please contact us if payment was deducted.");
        }
      }
    }

    loadOrder();
    return () => {
      cancelled = true;
    };
  }, [txnid]);

  const isPaid = orderDetails?.paid;

  return (
    <>
      <style>{`
        .checkout-success-page {
          min-height: 78vh;
          background: #faf7f2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        .checkout-success-decor {
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
        }

        .checkout-success-decor.gold {
          top: -10%;
          right: -5%;
          width: min(40vw, 400px);
          height: min(40vw, 400px);
          background: #fcd34d;
          opacity: 0.15;
          filter: blur(80px);
        }

        .checkout-success-decor.green {
          bottom: -10%;
          left: -5%;
          width: min(50vw, 500px);
          height: min(50vw, 500px);
          background: #0f766e;
          opacity: 0.12;
          filter: blur(100px);
        }

        .checkout-success-decor.rust {
          top: 20%;
          left: 10%;
          width: min(20vw, 200px);
          height: min(20vw, 200px);
          background: #c2410c;
          opacity: 0.08;
          filter: blur(60px);
        }

        .checkout-success-card {
          width: min(100%, 520px);
          background: #ffffff;
          border: 1px solid #eadfcd;
          border-radius: 24px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
          padding: 2.5rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .checkout-success-content {
          width: 100%;
        }

        .success-checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          background: #ecfdf5;
          box-shadow: inset 0px 0px 0px #059669;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }

        .check-icon {
          display: block;
          width: 40px;
          height: 40px;
          max-width: 40px;
          max-height: 40px;
          flex: 0 0 40px;
        }

        .check-line {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: stroke .6s cubic-bezier(0.65, 0, 0.45, 1) .8s forwards;
        }

        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        @keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
        @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 40px #ecfdf5; } }

        .fade-in-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .fade-in-up.visible { opacity: 1; transform: translateY(0); }

        .checkout-success-title {
          color: #2f2a26;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(1.8rem, 5vw, 2.35rem);
          font-weight: 700;
          line-height: 1.15;
          margin: 0 0 0.75rem;
        }

        .checkout-success-message {
          color: #6a6150;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0 0 2rem;
        }

        .checkout-success-message strong {
          color: #2f2a26;
        }

        .checkout-success-summary {
          background: #fdfaf6;
          border: 1px solid #eadfcd;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          margin-bottom: 2rem;
          padding: 1.5rem;
          text-align: left;
        }

        .checkout-success-meta {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: center;
          border-bottom: 1px solid #eadfcd;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
        }

        .checkout-success-meta-label {
          color: #9a917f;
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
        }

        .checkout-success-order-number {
          color: #2f2a26;
          display: block;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 1rem;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .checkout-success-status-cell {
          text-align: right;
          flex-shrink: 0;
        }

        .checkout-success-status {
          align-items: center;
          background: #ecfdf5;
          border: 1px solid #d1fae5;
          border-radius: 8px;
          color: #059669;
          display: inline-flex;
          font-size: 0.78rem;
          font-weight: 700;
          gap: 0.4rem;
          padding: 0.25rem 0.65rem;
        }

        .checkout-success-status-dot {
          background: #059669;
          border-radius: 999px;
          display: inline-block;
          height: 0.4rem;
          width: 0.4rem;
        }

        .checkout-success-items {
          display: grid;
          gap: 0.75rem;
        }

        .checkout-success-item,
        .checkout-success-total {
          align-items: start;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .checkout-success-item {
          color: #4b5563;
          font-size: 0.9rem;
        }

        .checkout-success-item-price {
          color: #2f2a26;
          font-weight: 600;
          white-space: nowrap;
        }

        .checkout-success-item-qty {
          color: #9a917f;
          margin-right: 0.4rem;
        }

        .checkout-success-address,
        .checkout-success-delivery,
        .checkout-success-total {
          border-top: 1px solid #eadfcd;
          color: #6a6150;
          font-size: 0.9rem;
          margin-top: 0.25rem;
          padding-top: 1rem;
        }

        .checkout-success-address-title,
        .checkout-success-delivery strong,
        .checkout-success-total-label {
          color: #2f2a26;
          font-weight: 700;
        }

        .checkout-success-total {
          align-items: center;
        }

        .checkout-success-total-value {
          color: #a0401b;
          font-size: 1.25rem;
          font-weight: 800;
        }

        .checkout-success-button {
          background: #2f2a26;
          border: 0;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          color: #ffffff;
          cursor: pointer;
          display: block;
          font-size: 1.02rem;
          font-weight: 600;
          padding: 0.9rem 1.5rem;
          text-align: center;
          text-decoration: none;
          transition: background 160ms ease, transform 160ms ease, box-shadow 160ms ease;
          width: 100%;
        }

        .checkout-success-button:hover {
          background: #1a1714;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
          color: #ffffff;
        }

        .checkout-success-button:active {
          transform: scale(0.98);
        }

        .checkout-success-loading {
          align-items: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 0;
        }

        .checkout-success-spinner {
          animation: checkout-success-spin 0.8s linear infinite;
          border: 3px solid #eadfcd;
          border-radius: 999px;
          border-top-color: #a0401b;
          height: 32px;
          margin-bottom: 1rem;
          width: 32px;
        }

        .checkout-success-loading-text {
          color: #6a6150;
          font-size: 0.9rem;
          font-weight: 600;
        }

        @keyframes checkout-success-spin { to { transform: rotate(360deg); } }

        @media (max-width: 560px) {
          .checkout-success-card {
            padding: 1.5rem;
          }

          .checkout-success-meta {
            align-items: flex-start;
            flex-direction: column;
          }

          .checkout-success-status-cell {
            text-align: left;
          }
        }
      `}</style>

      <div className="checkout-success-content">
        {isPaid && (
          <div className="success-checkmark">
            <svg className="check-icon" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path className="check-line" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        <div className={`fade-in-up ${animate || error ? "visible" : ""}`} style={{ transitionDelay: "0.2s" }}>
          <h1 className="checkout-success-title">
            {isPaid ? "Thank you for your order!" : "Checking your order"}
          </h1>

          <p className="checkout-success-message">
            {error || "Your beautiful handmade items will be crafted with care."}
            {orderDetails?.email && isPaid && (
              <span> We will send the confirmation details to <strong>{orderDetails.email}</strong>.</span>
            )}
          </p>

          <div className="checkout-success-summary">
            <div className="checkout-success-meta">
              <div>
                <span className="checkout-success-meta-label">Order Number</span>
                <span className="checkout-success-order-number">#{txnid || "KESHVI-ORD"}</span>
              </div>
              <div className="checkout-success-status-cell">
                <span className="checkout-success-meta-label">Status</span>
                <span className="checkout-success-status">
                  <span className="checkout-success-status-dot"></span>
                  {isPaid ? "Confirmed" : orderDetails?.status || "Verifying"}
                </span>
              </div>
            </div>

            {isPaid && (
              <div className="checkout-success-items">
                {orderDetails.items?.map((item, idx) => (
                  <div key={idx} className="checkout-success-item">
                    <span>
                      <span className="checkout-success-item-qty">{item.quantity}x</span>
                      {item.productTitle}
                    </span>
                    <span className="checkout-success-item-price">{formatInr(item.priceAtPurchasePaise * item.quantity)}</span>
                  </div>
                ))}

                {orderDetails.shippingAddress && (
                  <div className="checkout-success-address">
                    <div className="checkout-success-address-title">Shipping to</div>
                    <div>
                      {orderDetails.shippingAddress.address}, {orderDetails.shippingAddress.city} - {orderDetails.shippingAddress.pincode}
                    </div>
                  </div>
                )}

                {orderDetails.estimatedDelivery && (
                  <div className="checkout-success-delivery">
                    <strong>Estimated delivery:</strong>{" "}
                    <span>{orderDetails.estimatedDelivery}</span>
                  </div>
                )}

                <div className="checkout-success-total">
                  <span className="checkout-success-total-label">Total Paid</span>
                  <span className="checkout-success-total-value">{formatInr(orderDetails.totalAmountPaise)}</span>
                </div>
              </div>
            )}
          </div>

          <Link href="/" className="checkout-success-button">
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="checkout-success-page">
      <div className="checkout-success-decor gold" />
      <div className="checkout-success-decor green" />
      <div className="checkout-success-decor rust" />

      <div className="checkout-success-card">
        <Suspense fallback={
          <div className="checkout-success-loading">
            <div className="checkout-success-spinner"></div>
            <div className="checkout-success-loading-text">Securing your order details...</div>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
