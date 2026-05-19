"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

function SuccessContent() {
  const searchParams = useSearchParams();
  const txnid = searchParams.get("txnid");
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Trigger confetti on load
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#C2410C", "#0F766E", "#FBBF24"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#C2410C", "#0F766E", "#FBBF24"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Find the order in localStorage
    if (txnid) {
      try {
        const pastOrders = JSON.parse(localStorage.getItem("pastOrders") || "[]");
        const order = pastOrders.find((o: any) => o.id === txnid);
        if (order) {
          setOrderDetails(order);
        }
      } catch (e) {
        console.error("Could not load order details from local storage.");
      }
    }
  }, [txnid]);

  return (
    <div className="relative z-10">
      <div className="w-20 h-20 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#bbf7d0]">
        <svg className="w-10 h-10 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2f2a26] mb-3">
        Payment Successful!
      </h1>
      <p className="text-[#6a6150] mb-8 leading-relaxed">
        Thank you for your purchase. Your order <strong className="text-[#2f2a26]">{txnid}</strong> has been received and is being processed.
      </p>

      {orderDetails && (
        <div className="bg-[#fdfaf6] border border-[#eadfcd] rounded-xl p-5 mb-8 text-left">
          <h3 className="font-medium text-[#2f2a26] mb-3 pb-3 border-b border-[#eadfcd]">Order Summary</h3>
          <div className="space-y-3">
            {orderDetails.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-[#6a6150]">{item.qty}x {item.title || item.productSlug}</span>
                <span className="text-[#2f2a26] font-medium">₹{item.price * item.qty}</span>
              </div>
            ))}
            <div className="pt-3 mt-3 border-t border-[#eadfcd] flex justify-between font-bold text-[#C2410C]">
              <span>Total Paid</span>
              <span>₹{orderDetails.total}</span>
            </div>
          </div>
        </div>
      )}

      <Link href="/">
        <button className="w-full btn-primary py-3.5 px-6 rounded-xl font-medium text-lg transition-transform active:scale-[0.98]">
          Continue Shopping
        </button>
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full p-8 md:p-12 rounded-3xl border border-[#eadfcd] shadow-sm text-center relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[#fdfaf6] opacity-50 z-0 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C2410C] via-[#ea580c] to-[#f97316] z-10" />
        
        <Suspense fallback={<div className="p-8 text-center text-[#6a6150]">Loading your receipt...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
