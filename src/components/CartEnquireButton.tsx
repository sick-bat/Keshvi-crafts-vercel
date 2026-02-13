"use client";

import { showToast } from "@/components/Toast";
import { trackEvent } from "@/lib/analytics";

interface CartEnquireButtonProps {
    items: Array<{ title: string; qty: number; price: number }>;
    total: number;
}

export default function CartEnquireButton({ items, total }: CartEnquireButtonProps) {
    const handleEnquire = () => {
        const itemList = items.map(it => `${it.title} (x${it.qty})`).join(", ");
        const message = `Hi Keshvi Crafts! I want to enquire about my cart:\n\nItems: ${itemList}\n\nTotal: ₹${total}\n\nPlease share availability and delivery time.`;

        navigator.clipboard.writeText(message);
        window.open("https://ig.me/m/keshvi_crafts", "_blank", "noreferrer");
        showToast("Cart details copied! Paste in Instagram DM.");
        trackEvent({
            action: "click_instagram_enquiry",
            category: "Ecommerce",
            label: "Cart Enquiry",
            location: "cart",
            itemCount: items.length,
            total
        });
    };

    return (
        <button
            onClick={handleEnquire}
            className="btn-secondary w-full text-sm mt-3"
        >
            📸 Enquire on Instagram
        </button>
    );
}
