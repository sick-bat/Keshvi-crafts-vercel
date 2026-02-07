"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import products from "@/data/products.json";
import { addToCart, getCart } from "@/lib/bags";
import type { Product } from "@/types";

interface CheckoutAddonsProps {
    currentCartSlugs: string[];
}

export default function CheckoutAddons({ currentCartSlugs }: CheckoutAddonsProps) {
    const [addedSlugs, setAddedSlugs] = useState<Set<string>>(new Set());

    // Filter add-on products
    const addonProducts = (products as Product[])
        .filter(p => {
            // Must be direct purchase
            if (p.type !== "direct-purchase" && p.type !== undefined && p.type !== "custom-order") return false;
            if (p.type === "custom-order") return false;

            // Must be under ₹500
            if (p.price >= 500) return false;

            // Must be in stock
            if (typeof p.stock === "number" && p.stock <= 0) return false;

            // Must not be in cart
            if (currentCartSlugs.includes(p.slug)) return false;

            // Prefer certain categories
            const cat = (p.category || "").toLowerCase();
            const preferredCats = ["accessories", "keyrings", "coasters"];

            return preferredCats.some(c => cat.includes(c));
        })
        .slice(0, 4); // Max 4 products

    if (addonProducts.length === 0) return null;

    const handleAdd = (product: Product) => {
        addToCart(product, 1);
        setAddedSlugs(prev => new Set(prev).add(product.slug));

        // Reset after 2 seconds
        setTimeout(() => {
            setAddedSlugs(prev => {
                const next = new Set(prev);
                next.delete(product.slug);
                return next;
            });
        }, 2000);
    };

    return (
        <div className="bg-[#fffbeb] p-5 rounded-xl border border-[#fef3c7] mb-6">
            <h3 className="font-serif font-bold text-[#92400e] mb-1">
                Add a little something?
            </h3>
            <p className="text-sm text-[#b45309] mb-4">
                Handmade add-ons under ₹499
            </p>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {addonProducts.map(product => {
                    const isAdded = addedSlugs.has(product.slug);

                    return (
                        <div
                            key={product.slug}
                            className="bg-white rounded-lg p-3 border border-[#fef3c7] flex flex-col"
                        >
                            {/* Image */}
                            <div className="relative w-full h-24 mb-2 bg-stone-100 rounded overflow-hidden">
                                <Image
                                    src={product.images?.[0] || "/placeholder.png"}
                                    alt={product.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            </div>

                            {/* Title */}
                            <h4 className="text-xs font-medium text-[#2f2a26] mb-1 line-clamp-1">
                                {product.title}
                            </h4>

                            {/* Price */}
                            <p className="text-sm font-bold text-[#C2410C] mb-2">
                                ₹{product.price}
                            </p>

                            {/* Add Button */}
                            <button
                                onClick={() => handleAdd(product)}
                                disabled={isAdded}
                                className={`w-full py-1.5 text-xs font-semibold rounded transition-all ${isAdded
                                        ? "bg-green-100 text-green-700 cursor-default"
                                        : "bg-[#8B5E3C] text-white hover:bg-[#6F4E37]"
                                    }`}
                            >
                                {isAdded ? "Added ✓" : "Add"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
