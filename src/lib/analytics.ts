// Replaces direct GA4/gtag usage with generic dataLayer push
// GTM is the single source of truth.

export type GTMPayload = Record<string, any>;
type DataLayerWindow = typeof window & { dataLayer?: GTMPayload[] };

export const ANALYTICS_CONSENT_KEY = "analyticsConsent:v1";

export const hasAnalyticsConsent = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'granted';
};

/**
 * Safely push to dataLayer if window is defined.
 * @param payload Object to push to dataLayer
 */
export const pushToDataLayer = (payload: GTMPayload) => {
    if (typeof window !== 'undefined' && (payload.event === 'consent_update' || hasAnalyticsConsent())) {
        const browserWindow = window as DataLayerWindow;
        browserWindow.dataLayer = browserWindow.dataLayer || [];
        browserWindow.dataLayer.push(payload);
    }
};

// Generic event tracking for non-ecommerce events
export const trackEvent = ({ action, category, label, value, ...rest }: {
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
        ...rest
    });
};

// GA4 E-commerce Event Helpers

export const trackViewItem = (product: any) => {
    pushToDataLayer({
        event: "view_item",
        ecommerce: {
            currency: "INR",
            value: product.price,
            items: [{
                item_id: product.slug,
                item_name: product.title,
                price: product.price,
                quantity: 1,
                item_category: product.category
            }]
        }
    });
};

export const trackAddToCart = (product: any, quantity: number = 1) => {
    pushToDataLayer({
        event: "add_to_cart",
        ecommerce: {
            currency: "INR",
            value: product.price * quantity,
            items: [{
                item_id: product.slug,
                item_name: product.title,
                price: product.price,
                quantity: quantity,
                item_category: product.category
            }]
        }
    });
};

export const trackRemoveFromCart = (product: any, quantity: number = 1) => {
    pushToDataLayer({
        event: "remove_from_cart",
        ecommerce: {
            currency: "INR",
            value: product.price * quantity,
            items: [{
                item_id: product.slug,
                item_name: product.title,
                price: product.price,
                quantity: quantity
            }]
        }
    });
};

export const trackViewCart = (cartItems: any[], totalValue: number) => {
    pushToDataLayer({
        event: "view_cart",
        ecommerce: {
            currency: "INR",
            value: totalValue,
            items: cartItems.map(item => ({
                item_id: item.slug || item.productSlug,
                item_name: item.title,
                price: item.price,
                quantity: item.qty
            }))
        }
    });
};

export const trackBeginCheckout = (cartItems: any[], totalValue: number) => {
    pushToDataLayer({
        event: "begin_checkout",
        ecommerce: {
            currency: "INR",
            value: totalValue,
            items: cartItems.map(item => ({
                item_id: item.slug || item.productSlug,
                item_name: item.title,
                price: item.price,
                quantity: item.qty
            }))
        }
    });
};

export const trackPurchase = (transactionId: string, value: number, items: any[]) => {
    pushToDataLayer({
        event: "purchase",
        ecommerce: {
            transaction_id: transactionId,
            currency: "INR",
            value: value,
            items: items.map(item => ({
                item_id: item.slug || item.productSlug,
                item_name: item.title,
                price: item.price,
                quantity: item.qty
            }))
        }
    });
};
