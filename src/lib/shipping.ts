import { Product } from "@/types";

interface CartItem {
    slug: string;
    qty?: number; // Optional because sometime we might just pass products
    shippingCharge?: number;
    // allow other props
    [key: string]: any;
}

/**
 * Calculates shipping based on the locked rule:
 * - Free shipping (0) if subtotal > 650
 * - Otherwise MAX of shippingCharge of items in cart
 * @param cartItems List of items in cart (can be full products or cart line items)
 * @param subtotal Current cart subtotal
 */
export function calculateShipping(cartItems: CartItem[], subtotal: number): number {
    if (subtotal > 650) {
        return 0;
    }

    if (!cartItems || cartItems.length === 0) {
        return 0;
    }

    // Find the maximum shipping charge among items
    // If shippingCharge is undefined, assume 0
    let maxShipping = 0;

    for (const item of cartItems) {
        const charge = item.shippingCharge || 0;
        if (charge > maxShipping) {
            maxShipping = charge;
        }
    }

    return maxShipping;
}
