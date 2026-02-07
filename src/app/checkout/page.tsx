"use client";

import { useEffect, useState } from "react";
import products from "@/data/products.json";
import Link from "next/link";
import Image from "next/image";
import { calculateShipping } from "@/lib/shipping";
import { showToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import PriceProgressBar from "@/components/PriceProgressBar";
import CheckoutAddons from "@/components/CheckoutAddons";
import type { Product } from "@/types";

type Item = { slug: string; title: string; price: number; image?: string; qty?: number; productSlug?: string };
type P = any;

const productBySlug: Record<string, P> = Object.fromEntries(
  (products as P[]).map((p) => [p.slug, p])
);

export default function CheckoutPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [step, setStep] = useState<"details" | "payment">("details");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: ""
  });
  const router = useRouter();

  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem("cart") || "[]") as Item[];
      // CHECKOUT GUARD
      if (!existing || existing.length === 0) {
        showToast("Your cart is empty.");
        router.replace("/products");
        return;
      }

      // Guard against custom orders slipping in
      // Logic: If ANY item is custom order, we should probably remove it or block checkout?
      // Prompt says: "If cart empty OR only custom-order OR invalid -> redirect"
      // Since custom items shouldn't be in cart, let's just check invalid items
      const hasCustom = existing.some(it => {
        const p = productBySlug[it.productSlug || it.slug];
        return p?.type === 'custom-order';
      });

      if (hasCustom) {
        showToast("Custom items cannot be checked out directly. Please enquire.");
        router.replace("/cart"); // send back to cart to clean up
        return;
      }

      setItems(existing);

      // Load saved details if any
      const savedDetails = JSON.parse(localStorage.getItem("customer_details") || "{}");
      if (savedDetails.name) setFormData(savedDetails);
    }
    catch {
      setItems([]);
      router.replace("/products");
    }
  }, [router]);

  const total = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);

  // Shipping Calc
  const enrichedItems = items.map(it => {
    const p = productBySlug[it.productSlug || it.slug.split('-')[0]];
    return { ...it, shippingCharge: p?.shippingCharge };
  });

  // Calculate Discountable Subtotal (exclude custom-order)
  const discountableSubtotal = enrichedItems.reduce((s, it) => {
    const p = productBySlug[it.productSlug || it.slug.split('-')[0]];
    if (p?.type === "custom-order") return s;
    return s + it.price * (it.qty || 1);
  }, 0);

  // Discount Logic
  let discountPercent = 0;
  if (discountableSubtotal > 1800) discountPercent = 20;
  else if (discountableSubtotal > 1250) discountPercent = 10;

  const discountAmount = Math.round((discountableSubtotal * discountPercent) / 100);

  const shipping = calculateShipping(enrichedItems, total);
  const grandTotal = total - discountAmount + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("customer_details", JSON.stringify(formData));
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!items.length) {
    // Should have redirected, but show fallback
    return (
      <main className="container py-10 text-center">
        <h1 className="text-3xl font-serif mb-4">Checkout</h1>
        <p className="text-stone-600 mb-6">Redirecting...</p>
      </main>
    );
  }

  return (
    <main className="container py-10 max-w-2xl mx-auto">
      {/* NO INDEX */}
      <meta name="robots" content="noindex" />

      <h1 className="text-3xl font-serif font-bold text-[#2f2a26] mb-2 text-center">
        {step === "details" ? "Shipping Details" : "Complete Payment"}
      </h1>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-4 mb-8 text-sm">
        <div className={`flex items-center gap-2 ${step === "details" ? "font-bold text-[#C2410C]" : "text-stone-500"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === "details" ? "border-[#C2410C] bg-[#fff7ed]" : "border-stone-300"}`}>1</span>
          Details
        </div>
        <div className="w-12 h-px bg-stone-300"></div>
        <div className={`flex items-center gap-2 ${step === "payment" ? "font-bold text-[#C2410C]" : "text-stone-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === "payment" ? "border-[#C2410C] bg-[#fff7ed]" : "border-stone-300"}`}>2</span>
          Payment
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#eadfcd] shadow-sm">

        {step === "details" ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Aditi Sharma"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none"
                    placeholder="aditi@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Delivery Address</label>
                <textarea
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none resize-none"
                  placeholder="Flat No, Building, Street..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                  <input
                    required
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Pincode</label>
                  <input
                    required
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full btn-primary text-lg font-semibold">
                Continue to Payment
              </button>
              <p className="text-center text-xs text-stone-500 mt-3 flex items-center justify-center gap-1">
                🔒 Your details are stored securely for this session
              </p>
            </div>
          </form>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Price Progress Bar */}
            <PriceProgressBar subtotal={total} />

            {/* Order Review */}
            <div className="mb-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <h3 className="font-bold text-stone-800 mb-2 text-sm uppercase tracking-wider">Review Order</h3>
              <div className="space-y-3">
                {items.map(it => (
                  <div key={it.slug} className="flex justify-between text-sm">
                    <span>{it.qty}x {it.title}</span>
                    <span className="font-medium">₹{it.price * (it.qty || 1)}</span>
                  </div>
                ))}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-[#C2410C]">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-stone-500">
                  <span>Shipping</span>
                  <span className="font-medium">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>

                <div className="pt-2 mt-2 border-t border-stone-200 flex justify-between font-bold text-[#C2410C] text-lg">
                  <span>Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Checkout Add-ons */}
            <CheckoutAddons currentCartSlugs={items.map(it => it.slug)} />

            <div className="mb-6">
              <p className="text-stone-600 mb-2">Since we are currently collecting payments per item, please complete the payment for each item below:</p>

              <div className="space-y-4">
                {items.map((it) => {
                  const p = productBySlug[it.productSlug || it.slug.split('-')[0]] || productBySlug[it.slug];
                  // Fallback logic for finding product
                  const link = p?.checkoutUrl;

                  return (
                    <div key={it.slug} className="flex items-center justify-between p-3 border border-[#eadfcd] rounded-lg bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative bg-stone-100 rounded overflow-hidden">
                          <Image
                            src={it.image || "/placeholder.png"}
                            alt={it.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-stone-800 text-sm">{it.title}</div>
                          <div className="text-xs text-stone-500">₹{it.price} x {it.qty}</div>
                        </div>
                      </div>

                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm whitespace-nowrap"
                        >
                          Pay ₹{it.price * (it.qty || 1)}
                        </a>
                      ) : (
                        <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded">Link Unavailable</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              onClick={() => setStep("details")}
              className="text-sm text-stone-500 hover:text-stone-800 underline underline-offset-4"
            >
              Back to Details
            </button>
          </div>
        )}
      </div>

    </main>
  );
}
