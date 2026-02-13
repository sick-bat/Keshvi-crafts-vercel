export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Declare global window property for GA
declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        // dataLayer: any[]; // Removed to avoid conflict with @next/third-parties or other declarations
    }
}

export const pageview = (url: string) => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('config', GA_TRACKING_ID, {
            page_path: url,
        });
    } else {
        console.log(`[Analytics] Page View: ${url}`);
    }
};

export const trackEvent = ({ action, category, label, value }: {
    action: string;
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
}) => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    } else {
        console.log(`[Analytics] Event: ${action}`, { category, label, value });
    }
};
