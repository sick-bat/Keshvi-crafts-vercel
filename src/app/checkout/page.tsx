"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCart, clearCart } from "@/lib/bags";
import products from "@/data/products.json";
import { calculateShipping } from "@/lib/shipping";
import type { Product } from "@/types";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    pincode: "",
    instagram: "",
    orderNote: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Enrich items with shipping info for calculation
  const enrichedItems = cart.map(it => {
    const p = (products as Product[]).find(x => x.slug === it.slug || x.slug === (it as any).productSlug);
    return { ...it, shippingCharge: p?.shippingCharge };
  });

  // Calculate Discountable Subtotal
  const discountableSubtotal = enrichedItems.reduce((s, it) => {
    const p = (products as Product[]).find(x => x.slug === it.slug || x.slug === (it as any).productSlug);
    if (p?.type === "custom-order") return s;
    return s + it.price * it.qty;
  }, 0);

  let discountPercent = 0;
  if (discountableSubtotal > 1800) discountPercent = 20;
  else if (discountableSubtotal > 1250) discountPercent = 10;

  const discountAmount = Math.round((discountableSubtotal * discountPercent) / 100);
  const shipping = calculateShipping(enrichedItems, total);
  const grandTotal = total - discountAmount + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error on change
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone Number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Order Submitted Data:");
      console.log({
        ...formData,
        cartItems: cart,
        cartTotal: total,
        discountAmount,
        shipping,
        grandTotal
      });
      clearCart();
      sessionStorage.setItem("triggerToast", "Order placed please continue shopping");
      router.push("/");
    }
  };

  // Prevent hydration mismatch on initial render
  if (cart.length === 0 && typeof window === 'undefined') {
      return <div className="bg-[#FAF7F2] min-h-screen pb-24 border-t border-transparent" />;
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-24">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-[#2f2a26] font-serif mb-8 mt-4">Checkout</h1>
        
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
            
          {/* Left Column: Form */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#eadfcd] shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <h2 className="text-xl font-bold text-[#2f2a26] font-serif border-b border-[#eadfcd] pb-4">Shipping Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#2f2a26]">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none transition-shadow ${errors.fullName ? 'border-red-500' : 'border-[#eadfcd]'}`}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#2f2a26]">Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none transition-shadow ${errors.phoneNumber ? 'border-red-500' : 'border-[#eadfcd]'}`}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#2f2a26]">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Block A, Sector 4"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none transition-shadow ${errors.address ? 'border-red-500' : 'border-[#eadfcd]'}`}
                />
                {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#2f2a26]">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="New Delhi"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none transition-shadow ${errors.city ? 'border-red-500' : 'border-[#eadfcd]'}`}
                  />
                  {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#2f2a26]">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="110001"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none transition-shadow ${errors.pincode ? 'border-red-500' : 'border-[#eadfcd]'}`}
                  />
                  {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#2f2a26]">Instagram Username (Optional)</label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@yourusername"
                  className="w-full px-4 py-2 border border-[#eadfcd] rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#2f2a26]">Order Note (Optional)</label>
                <textarea
                  name="orderNote"
                  value={formData.orderNote}
                  onChange={handleChange}
                  placeholder="Any special requests or details..."
                  rows={4}
                  className="w-full px-4 py-2 border border-[#eadfcd] rounded-lg focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none transition-shadow resize-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-[#eadfcd]">
                <button 
                  type="submit" 
                  className="w-full btn-primary py-3 px-6 rounded-lg text-lg font-medium text-center"
                >
                  Place Order (₹{grandTotal})
                </button>
              </div>
              
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#eadfcd] shadow-sm sticky top-24">
              <h3 className="font-serif text-xl font-bold text-[#2f2a26] mb-4">Order Summary</h3>

              {/* Items List */}
              <div className="space-y-4 mb-6">
                {cart.map((it) => (
                  <div key={it.slug} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-[#f5f5f5] rounded-md border border-[#f0e6d6] flex-shrink-0 overflow-hidden">
                      <Image 
                        src={it.image || "/placeholder.png"} 
                        fill 
                        alt={it.title} 
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-1 text-sm flex flex-col justify-center">
                      <span className="text-[#2f2a26] font-medium leading-snug block mb-1">{it.title}</span>
                      <span className="text-[#6a6150]">Qty: {it.qty}</span>
                    </div>
                    <div className="text-sm font-medium text-[#2f2a26] flex items-center">
                      ₹{it.price * it.qty}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm text-[#4b5563] mb-4 border-t border-[#f3f4f6] pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#2f2a26]">₹{total}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#C2410C]">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[#0F766E]">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
              </div>

              <div className="h-px bg-[#e5e7eb] my-4" />

              <div className="flex justify-between items-end">
                <span className="font-semibold text-lg text-[#2f2a26]">Total</span>
                <span className="font-bold text-2xl text-[#C2410C]">₹{grandTotal}</span>
              </div>
            </div>

            {/* Emotional Reinforcement Block from Cart */}
            <div className="bg-[#fffbeb] p-5 rounded-xl border border-[#fef3c7]">
              <h4 className="font-serif font-bold text-[#92400e] mb-2 flex items-center gap-2">
                <span>💝</span> Why your order is special
              </h4>
              <ul className="text-sm space-y-2 text-[#b45309]">
                <li className="flex gap-2">
                  <span className="mt-0.5">•</span>
                  <span><strong>Handmade for you:</strong> Not mass produced in a factory.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5">•</span>
                  <span><strong>Crafted with care:</strong> Every stitch is intentional.</span>
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
