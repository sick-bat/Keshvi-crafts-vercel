"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DISPLAY_CATEGORIES } from "@/lib/categories";

export default function CategoryChips() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get("category");

    const handleCategoryClick = (category: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category) {
            params.set("category", category);
        } else {
            params.delete("category");
        }
        router.push(`/collections?${params.toString()}`);
    };

    return (
        <div className="category-chips-container">
            <div className="category-chips-scroll">
                <button
                    onClick={() => handleCategoryClick(null)}
                    className={`category-chip ${!activeCategory ? "active" : ""}`}
                >
                    All
                </button>
                {DISPLAY_CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`category-chip ${activeCategory === cat ? "active" : ""}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
}
