type EventName =
    | "add_to_cart"
    | "view_item"
    | "begin_checkout"
    | "click_instagram_enquiry"
    | "remove_from_cart";

export function trackEvent(name: EventName, data: Record<string, any> = {}) {
    // Stub for analytics
    if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] ${name}:`, data);
    }
    // Future: window.gtag(...) or similar
}
