"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCart } from "@/lib/bags";
import products from "@/data/products.json";
import { calculateShipping } from "@/lib/shipping";
import type { Product } from "@/types";
import "./checkout.css";
import { trackBeginCheckout } from "@/lib/analytics";

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: {
              componentRestrictions?: { country: string | string[] };
              fields?: string[];
              types?: string[];
            }
          ) => {
            addListener: (eventName: string, handler: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              address_components?: Array<{
                long_name: string;
                short_name: string;
                types: string[];
              }>;
            };
          };
        };
      };
    };
    initCheckoutPlacesAutocomplete?: () => void;
  }
}

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const googleMapsScriptId = "google-maps-places-script";

const getAddressPart = (
  components: Array<{ long_name: string; short_name: string; types: string[] }> | undefined,
  type: string,
  name: "long_name" | "short_name" = "long_name"
) => components?.find((component) => component.types.includes(type))?.[name] || "";

export default function CheckoutPage() {
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const placesInitializedRef = useRef(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    whatsappNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    instagram: "",
    orderNote: "",
    whatsappUpdates: false,
    billingSameAsShipping: true,
    acceptedPolicies: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState("");
  const [tracked, setTracked] = useState(false);
  const [placesStatus, setPlacesStatus] = useState<"idle" | "ready" | "unavailable">(
    googleMapsApiKey ? "idle" : "unavailable"
  );

  useEffect(() => {
    const loadedCart = getCart();
    setCart(loadedCart);
    setMounted(true);
    const error = new URLSearchParams(window.location.search).get("error");
    const errorMessages: Record<string, string> = {
      server_error: "We could not confirm the payment response. If any amount was deducted, please contact us with your order number before trying again.",
      hash_mismatch: "We could not safely verify the payment response. Please retry checkout or contact us if money was deducted.",
      amount_mismatch: "The payment amount did not match the order total, so we stopped the confirmation for your safety.",
      order_not_found: "We could not find this order. Please retry checkout or contact us if payment was deducted.",
      payment_failed: "Payment was not completed. Your cart is still here if you would like to try again.",
      invalid_payment_return: "This payment return link is not valid. Please start checkout again from your cart.",
    };
    if (error) setCheckoutNotice(errorMessages[error] || "Something interrupted checkout. Please review your details and try again.");

    if (loadedCart.length > 0 && !tracked) {
      const initialTotal = loadedCart.reduce((acc, item) => acc + item.price * item.qty, 0);
      trackBeginCheckout(loadedCart, initialTotal);
      setTracked(true);
    }
  }, [tracked]);

  useEffect(() => {
    if (!googleMapsApiKey || !addressInputRef.current) return;

    const initializeAutocomplete = () => {
      if (
        placesInitializedRef.current ||
        !addressInputRef.current ||
        !window.google?.maps?.places?.Autocomplete
      ) return;

      placesInitializedRef.current = true;

      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: "in" },
        fields: ["address_components", "formatted_address"],
        types: ["address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const components = place.address_components;
        const premise = getAddressPart(components, "premise");
        const subpremise = getAddressPart(components, "subpremise");
        const streetNumber = getAddressPart(components, "street_number");
        const route = getAddressPart(components, "route");
        const neighborhood = getAddressPart(components, "neighborhood");
        const sublocality =
          getAddressPart(components, "sublocality_level_1") ||
          getAddressPart(components, "sublocality");
        const locality =
          getAddressPart(components, "locality") ||
          getAddressPart(components, "administrative_area_level_3");
        const state = getAddressPart(components, "administrative_area_level_1");
        const pincode = getAddressPart(components, "postal_code", "short_name");
        const streetLine = [subpremise, premise, streetNumber, route].filter(Boolean).join(" ");
        const streetAddress = [streetLine, neighborhood, sublocality].filter(Boolean).join(", ");

        setFormData((current) => ({
          ...current,
          address: streetAddress || place.formatted_address || current.address,
          city: locality || current.city,
          state: state || current.state,
          pincode: pincode || current.pincode,
        }));
        setErrors((current) => {
          const next = { ...current };
          for (const key of ["address", "city", "state", "pincode"]) {
            if (next[key]) delete next[key];
          }
          return next;
        });
      });

      setPlacesStatus("ready");
    };

    if (window.google?.maps?.places?.Autocomplete) {
      initializeAutocomplete();
      return;
    }

    window.initCheckoutPlacesAutocomplete = initializeAutocomplete;

    const existingScript = document.getElementById(googleMapsScriptId);
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = googleMapsScriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsApiKey)}&libraries=places&callback=initCheckoutPlacesAutocomplete`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setPlacesStatus("unavailable");
    document.head.appendChild(script);
  }, []);

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const findCartProduct = (item: any) => {
    return (products as Product[]).find((x) =>
      x.slug === item.slug ||
      x.slug === item.productSlug ||
      String(item.slug || '').startsWith(`${x.slug}-`)
    );
  };

  // Enrich items with shipping info for calculation
  const enrichedItems = cart.map(it => {
    const p = findCartProduct(it);
    return { ...it, shippingCharge: p?.shippingCharge };
  });

  // Calculate Discountable Subtotal
  const discountableSubtotal = enrichedItems.reduce((s, it) => {
    const p = findCartProduct(it);
    if (p?.type === "custom-order") return s;
    return s + it.price * it.qty;
  }, 0);

  let discountPercent = 0;
  if (discountableSubtotal > 1800) discountPercent = 20;
  else if (discountableSubtotal > 1250) discountPercent = 10;

  const discountAmount = Math.round((discountableSubtotal * discountPercent) / 100);
  const shipping = calculateShipping(enrichedItems, total);
  const grandTotal = total - discountAmount + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error on change
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validate = (form?: HTMLFormElement) => {
    const newErrors: Record<string, string> = {};
    const acceptedPolicies = form
      ? Boolean((new FormData(form).get("acceptedPolicies")))
      : formData.acceptedPolicies;

    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!/^[6-9]\d{9}$/.test(formData.phoneNumber.replace(/\D/g, ""))) newErrors.phoneNumber = "Valid Indian phone number is required";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Valid Email is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!/^\d{6}$/.test(formData.pincode.trim())) newErrors.pincode = "Valid 6-digit PIN code is required";
    if (!acceptedPolicies) newErrors.acceptedPolicies = "Please accept the store policies";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setPaymentError("");

    if (!validate(e.currentTarget as HTMLFormElement)) {
      return;
    }

      setIsProcessing(true);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20_000);

      try {
        const response = await fetch('/api/payu/hash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData, cart, grandTotal }),
          signal: controller.signal,
        });
        window.clearTimeout(timeout);

        const result = await response.json().catch(() => null);

        if (!response.ok || !result) {
          const message = result?.error || "Unable to start payment. Please try again.";
          throw new Error(message);
        }

        if (
          result.success &&
          result.actionUrl &&
          result.key &&
          result.txnid &&
          result.amount &&
          result.productInfo &&
          result.firstName &&
          result.email &&
          result.phone &&
          result.hash
        ) {
          const orderData = {
            id: result.txnid,
            date: new Date().toISOString(),
            items: cart,
            total: grandTotal,
            status: "Processing"
          };
          try {
            const pastOrders = JSON.parse(localStorage.getItem("pastOrders") || "[]");
            pastOrders.unshift(orderData);
            localStorage.setItem("pastOrders", JSON.stringify(pastOrders));
          } catch (err) {}

          const form = document.createElement("form");
          form.setAttribute("method", "post");
          form.setAttribute("action", result.actionUrl);
          form.setAttribute("target", "_self");
          form.style.display = "none";

          const payuFields = {
            key: result.key,
            txnid: result.txnid,
            amount: result.amount,
            productinfo: result.productInfo,
            firstname: result.firstName,
            email: result.email,
            phone: result.phone,
            udf1: result.udf?.udf1 || "",
            udf2: result.udf?.udf2 || "",
            udf3: result.udf?.udf3 || "",
            udf4: result.udf?.udf4 || "",
            udf5: result.udf?.udf5 || "",
            udf6: result.udf?.udf6 || "",
            udf7: result.udf?.udf7 || "",
            udf8: result.udf?.udf8 || "",
            udf9: result.udf?.udf9 || "",
            udf10: result.udf?.udf10 || "",
            surl: result.surl,
            furl: result.furl,
            hash: result.hash
          };

          for (const [k, v] of Object.entries(payuFields)) {
            const hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", k);
            hiddenField.setAttribute("value", v as string);
            form.appendChild(hiddenField);
          }

          document.body.appendChild(form);
          HTMLFormElement.prototype.submit.call(form);

          window.setTimeout(() => {
            setPaymentError("Payment gateway did not open. Please refresh and try again.");
            setIsProcessing(false);
          }, 12_000);
        } else {
          throw new Error(result.error || 'Failed to initiate payment. Please try again.');
        }
      } catch (error) {
        console.error(error);
        window.clearTimeout(timeout);
        setPaymentError(
          error instanceof DOMException && error.name === "AbortError"
            ? "Payment setup is taking too long. Please refresh and try again."
            : error instanceof Error
              ? error.message
              : "An error occurred. Please try again."
        );
        setIsProcessing(false);
      }
  };

  if (!mounted) {
      return <div className="checkout-page" />;
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <header className="checkout-logo-header">
          <Link href="/">
            <Image src="/uploads/hero/logo.png" alt="Keshvi Crafts" width={80} height={80} />
          </Link>
        </header>
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>
            Choose a handmade gift or crochet piece first. We will keep checkout clear, secure, and ready when you return.
          </p>
          <Link href="/collections" className="checkout-submit-btn" style={{textDecoration: 'none'}}>
            Browse Handmade Gifts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Centered Logo Header - Only branding */}
      <header className="checkout-logo-header">
        <Link href="/">
          <Image src="/uploads/hero/logo.png" alt="Keshvi Crafts" width={80} height={80} />
        </Link>
      </header>

      <div className="checkout-intro">
        <span className="checkout-intro-kicker">Secure handmade checkout</span>
        <h1>Complete your Keshvi order</h1>
        <p>Review your handmade pieces, add delivery details, and continue to PayU’s secure payment page.</p>
      </div>

      <div className="checkout-grid">
        {/* Left Column: Form */}
        <div className="checkout-form-card">
          <Link href="/cart" className="checkout-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Return to Cart
          </Link>

          {checkoutNotice && (
            <div className="checkout-alert" role="alert">
              <div className="checkout-alert-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <div>
                <strong>Payment needs another try</strong>
                <span>{checkoutNotice}</span>
              </div>
            </div>
          )}
          
          <div className="checkout-section-heading">
            <span>Step 1 of 2</span>
            <h2>Shipping Details</h2>
          </div>

          <div className="checkout-trust-row" aria-label="Checkout trust highlights">
            <span>Encrypted payment</span>
            <span>Handmade in India</span>
            <span>Order updates</span>
          </div>

          <form onSubmit={handleSubmit} className="checkout-form-grid" noValidate>
            
            <div className={`floating-field ${errors.email ? 'has-error' : ''}`}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder=" "
              />
              <label htmlFor="email">Email Address *</label>
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="checkout-form-row">
              <div className={`floating-field ${errors.fullName ? 'has-error' : ''}`}>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="fullName">Full Name *</label>
                {errors.fullName && <div className="field-error">{errors.fullName}</div>}
              </div>

              <div className={`floating-field ${errors.phoneNumber ? 'has-error' : ''}`}>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="phoneNumber">Phone Number *</label>
                {errors.phoneNumber && <div className="field-error">{errors.phoneNumber}</div>}
              </div>
            </div>

            <div className="floating-field">
              <input
                type="tel"
                id="whatsappNumber"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder=" "
              />
              <label htmlFor="whatsappNumber">WhatsApp Number (Optional)</label>
            </div>

            <label className="checkout-checkbox">
              <input
                type="checkbox"
                name="whatsappUpdates"
                checked={formData.whatsappUpdates}
                onChange={handleChange}
              />
              <span>Send order updates and tracking information via WhatsApp</span>
            </label>

            <div className="checkout-divider" />

            <div className={`floating-field ${errors.address ? 'has-error' : ''}`}>
              <input
                type="text"
                id="address"
                name="address"
                ref={addressInputRef}
                value={formData.address}
                onChange={handleChange}
                placeholder=" "
                autoComplete="street-address"
              />
              <label htmlFor="address">Street Address *</label>
              {errors.address && <div className="field-error">{errors.address}</div>}
              {placesStatus === "ready" && (
                <div className="field-helper">Start typing and choose your address to autofill city, state, and PIN.</div>
              )}
            </div>

            <div className="checkout-form-row">
              <div className={`floating-field ${errors.city ? 'has-error' : ''}`}>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="city">City *</label>
                {errors.city && <div className="field-error">{errors.city}</div>}
              </div>

              <div className={`floating-field ${errors.state ? 'has-error' : ''}`}>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="state">State *</label>
                {errors.state && <div className="field-error">{errors.state}</div>}
              </div>
            </div>

            <div className="checkout-form-row">
              <div className={`floating-field ${errors.pincode ? 'has-error' : ''}`}>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="pincode">PIN Code *</label>
                {errors.pincode && <div className="field-error">{errors.pincode}</div>}
              </div>
              
              <div className="floating-field">
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="instagram">Instagram Username (Optional)</label>
              </div>
            </div>

            <div className="floating-field">
              <textarea
                id="orderNote"
                name="orderNote"
                value={formData.orderNote}
                onChange={handleChange}
                placeholder=" "
              />
              <label htmlFor="orderNote">Order Notes (Optional)</label>
            </div>

            <label className="checkout-checkbox" style={{marginTop: '0.5rem'}}>
              <input
                type="checkbox"
                name="billingSameAsShipping"
                checked={formData.billingSameAsShipping}
                onChange={handleChange}
              />
              <span>Billing address is same as shipping address</span>
            </label>

            <label className="checkout-checkbox" style={{marginTop: '0.5rem'}}>
              <input
                type="checkbox"
                name="acceptedPolicies"
                checked={formData.acceptedPolicies}
                onChange={handleChange}
                required
              />
              <span>
                I agree to the <Link href="/terms" target="_blank">Terms</Link>, <Link href="/privacy" target="_blank">Privacy Policy</Link>, and <Link href="/returns" target="_blank">Returns Policy</Link>.
              </span>
            </label>
            {errors.acceptedPolicies && <div className="field-error">{errors.acceptedPolicies}</div>}

            <button 
              type="submit" 
              disabled={isProcessing || !formData.acceptedPolicies}
              className="checkout-submit-btn"
            >
              {isProcessing ? (
                <>
                  <span className="checkout-spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </>
              )}
            </button>
            {paymentError && (
              <div className="checkout-payment-error" role="alert">
                {paymentError}
              </div>
            )}
            <div className="checkout-secure-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              256-bit secure encryption
            </div>
            
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="checkout-summary">
          <div className="checkout-summary-card">
            <h3 className="checkout-summary-title">Order Summary</h3>

            {/* Items List */}
            <div className="checkout-summary-items">
              {cart.map((it) => (
                <div key={it.slug} className="checkout-summary-item">
                  <div className="checkout-summary-item-image">
                    <Image 
                      src={it.image || "/placeholder.png"} 
                      fill 
                      alt={it.title} 
                      sizes="52px"
                    />
                  </div>
                  <div className="checkout-summary-item-info">
                    <span className="checkout-summary-item-name">{it.title}</span>
                    <span className="checkout-summary-item-qty">Qty: {it.qty}</span>
                  </div>
                  <div className="checkout-summary-item-price">
                    ₹{it.price * it.qty}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="checkout-summary-totals">
              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="checkout-summary-row discount">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              
              <div className="checkout-summary-row shipping">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-total">
              <span className="checkout-summary-total-label">Total</span>
              <span className="checkout-summary-total-value">₹{grandTotal}</span>
            </div>
            
            <div className="checkout-emotional-block">
              <h4>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                Why your order is special
              </h4>
              <ul>
                <li>
                  <span style={{flexShrink:0}}>•</span>
                  <span><strong>Handmade for you:</strong> Not mass produced in a factory.</span>
                </li>
                <li>
                  <span style={{flexShrink:0}}>•</span>
                  <span><strong>Crafted with care:</strong> Every stitch is intentional.</span>
                </li>
              </ul>
            </div>

            <div className="checkout-summary-assurance">
              <div>
                <strong>Need help?</strong>
                <span>Message us before paying if you want a color or gifting note confirmed.</span>
              </div>
              <Link href="/contact">Contact</Link>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}
