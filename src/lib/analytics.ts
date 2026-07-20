// Anonymous & Cookieless GTM / GA4 Analytics Engine
// All events are dispatched without user PII and operate via cookieless pings.

export type GTMPayload = Record<string, any>;
type DataLayerWindow = typeof window & { dataLayer?: GTMPayload[] };

// List of restricted PII keys to automatically strip from any dataLayer push
const PII_KEYS = new Set([
  "email",
  "phone",
  "phonenumber",
  "whatsappnumber",
  "fullname",
  "firstname",
  "lastname",
  "address",
  "street",
  "city",
  "pincode",
  "instagram",
  "ordernote",
  "billingaddress",
  "shippingaddress",
  "user_id",
  "userid",
]);

/**
 * Recursively scrub PII keys and values from dataLayer objects
 */
export const sanitizePayload = (obj: any): any => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePayload);

  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (PII_KEYS.has(lowerKey)) {
      continue; // Omit PII key completely
    }

    if (value && typeof value === "object") {
      cleanObj[key] = sanitizePayload(value);
    } else if (typeof value === "string") {
      // Additional safety check: regex test for emails or 10-digit phone numbers
      if (
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
        /^[6-9]\d{9}$/.test(value.replace(/\D/g, ""))
      ) {
        continue;
      }
      cleanObj[key] = value;
    } else {
      cleanObj[key] = value;
    }
  }
  return cleanObj;
};

/**
 * Safely push to dataLayer if window is defined.
 * Automatically scrubs PII to maintain strict anonymous tracking.
 */
export const pushToDataLayer = (payload: GTMPayload) => {
  if (typeof window !== "undefined") {
    const browserWindow = window as DataLayerWindow;
    browserWindow.dataLayer = browserWindow.dataLayer || [];
    const cleanPayload = sanitizePayload(payload);
    browserWindow.dataLayer.push(cleanPayload);
  }
};

/**
 * Reset GA4 ecommerce object state to prevent parameter leakage across SPA page transitions.
 */
export const resetEcommerce = () => {
  pushToDataLayer({ ecommerce: null });
};

// Generic event tracking for non-ecommerce events
export const trackEvent = ({
  action,
  category,
  label,
  value,
  ...rest
}: {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}) => {
  pushToDataLayer({
    event: action,
    category,
    label,
    value,
    ...rest,
  });
};

// Standard GA4 E-Commerce Event Helpers

export const trackViewItem = (product: any) => {
  if (!product) return;
  resetEcommerce();
  const price = Number(product.price || product.minPrice || 0);
  pushToDataLayer({
    event: "view_item",
    ecommerce: {
      currency: "INR",
      value: price,
      items: [
        {
          item_id: product.slug,
          item_name: product.title,
          price: price,
          quantity: 1,
          item_category: product.category || "Handmade Crochet",
        },
      ],
    },
  });
};

export const trackAddToCart = (product: any, quantity: number = 1) => {
  if (!product) return;
  resetEcommerce();
  const price = Number(product.price || 0);
  const qty = Number(quantity || 1);
  pushToDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency: "INR",
      value: price * qty,
      items: [
        {
          item_id: product.slug || product.productSlug,
          item_name: product.title,
          price: price,
          quantity: qty,
          item_category: product.category || "Handmade Crochet",
        },
      ],
    },
  });
};

export const trackRemoveFromCart = (product: any, quantity: number = 1) => {
  if (!product) return;
  resetEcommerce();
  const price = Number(product.price || 0);
  const qty = Number(quantity || 1);
  pushToDataLayer({
    event: "remove_from_cart",
    ecommerce: {
      currency: "INR",
      value: price * qty,
      items: [
        {
          item_id: product.slug || product.productSlug,
          item_name: product.title,
          price: price,
          quantity: qty,
        },
      ],
    },
  });
};

export const trackViewCart = (cartItems: any[], totalValue: number) => {
  resetEcommerce();
  const validItems = Array.isArray(cartItems) ? cartItems : [];
  pushToDataLayer({
    event: "view_cart",
    ecommerce: {
      currency: "INR",
      value: Number(totalValue || 0),
      items: validItems.map((item) => ({
        item_id: item.slug || item.productSlug,
        item_name: item.title,
        price: Number(item.price || 0),
        quantity: Number(item.qty || 1),
        item_category: item.category || "Handmade Crochet",
      })),
    },
  });
};

export const trackBeginCheckout = (cartItems: any[], totalValue: number) => {
  resetEcommerce();
  const validItems = Array.isArray(cartItems) ? cartItems : [];
  pushToDataLayer({
    event: "begin_checkout",
    ecommerce: {
      currency: "INR",
      value: Number(totalValue || 0),
      items: validItems.map((item) => ({
        item_id: item.slug || item.productSlug,
        item_name: item.title,
        price: Number(item.price || 0),
        quantity: Number(item.qty || 1),
        item_category: item.category || "Handmade Crochet",
      })),
    },
  });
};

export const trackPurchase = (transactionId: string, value: number, items: any[]) => {
  resetEcommerce();
  const validItems = Array.isArray(items) ? items : [];
  // Ensure transaction_id is sanitized alphanumeric string
  const cleanTxnId = String(transactionId || "").replace(/[^\w-]/g, "");

  pushToDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: cleanTxnId,
      currency: "INR",
      value: Number(value || 0),
      items: validItems.map((item) => ({
        item_id: item.slug || item.productSlug || item.id,
        item_name: item.title || item.productTitle,
        price: Number(item.price || 0),
        quantity: Number(item.qty || item.quantity || 1),
      })),
    },
  });
};
