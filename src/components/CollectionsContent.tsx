// app/collections/CollectionsContent.tsx
"use client";

import products from "@/data/products.json";
import { getDisplayCategory, DISPLAY_CATEGORIES } from "@/lib/categories";
import ProductCard from "@/components/ProductCardV2";
import BottomSheet from "@/components/BottomSheet";
import CategoryChips from "@/components/CategoryChips";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types";

type SortOption = "default" | "price-low" | "price-high" | "newest";

export default function CollectionsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const tagParam = searchParams.get("tag");
  const maxPriceParam = searchParams.get("maxPrice");

  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [category, setCategory] = useState<string | null>(categoryParam);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (categoryParam) setCategory(categoryParam);
  }, [categoryParam]);



  // ... existing imports

  // Filter out variants and hidden items
  // Also dedupe by slug just in case
  const live = useMemo(() => {
    const all = (products as Product[]).filter(p => (p.status ?? "live") !== "hidden" && !p.isVariant);
    const seen = new Set();
    return all.filter(p => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    });
  }, []);

  // Use defined Display Categories
  const categories = DISPLAY_CATEGORIES;

  // Filter Logic
  const filtered = useMemo(() => {
    let result = live;

    // 1. Category Filter (Match Display Category)
    if (category) {
      result = result.filter((p) => getDisplayCategory(p.category || "") === category);
    }

    // 2. Tag Filter (e.g. Valentine)
    if (tagParam) {
      const t = tagParam.toLowerCase().trim();
      result = result.filter(p => p.tags?.some(pt => pt.toLowerCase().trim() === t));
    }

    // 3. Max Price Filter
    if (maxPriceParam) {
      const mp = parseInt(maxPriceParam, 10);
      if (!isNaN(mp)) {
        result = result.filter(p => (p.minPrice || p.price) <= mp);
      }
    }

    return result;
  }, [live, category, tagParam, maxPriceParam]);

  // Sort Logic
  const sorted = useMemo(() => {
    const data = [...filtered];
    switch (sortBy) {
      case "price-low":
        return data.sort((a, b) => (a.minPrice || a.price) - (b.minPrice || b.price));
      case "price-high":
        return data.sort((a, b) => (b.minPrice || b.price) - (a.minPrice || a.price));
      case "newest":
        return data.sort((a, b) => { // Prioritize New badge, then default priority
          const aNew = a.badges?.includes("New") || a.badge === "New" ? 1 : 0;
          const bNew = b.badges?.includes("New") || b.badge === "New" ? 1 : 0;
          if (aNew !== bNew) return bNew - aNew;
          return (b.priority ?? -9999) - (a.priority ?? -9999);
        });
      case "default":
      default:
        // Priority DESC, then Price ASC
        return data.sort((a, b) => {
          const pA = a.priority ?? -9999;
          const pB = b.priority ?? -9999;
          if (pA !== pB) return pB - pA;
          return (a.minPrice || a.price) - (b.minPrice || b.price);
        });
    }
  }, [filtered, sortBy]);

  const handleApplyFilters = () => {
    setFiltersOpen(false);
  };

  const handleResetFilters = () => {
    setCategory(null);
    setFiltersOpen(false);
  };

  // Title Logic
  const getPageTitle = () => {
    if (tagParam) return `${tagParam.charAt(0).toUpperCase() + tagParam.slice(1)} Collection`;
    if (maxPriceParam) return `Under ₹${maxPriceParam}`;
    if (category) return `${category} Collection`;
    return "All Collections";
  }

  return (
    <>
      {/* Header */}
      <div className="collections-header">
        <h1 className="collections-title">
          {getPageTitle()}
        </h1>
        {getPageTitle() === "All Collections" && (
          <p className="text-stone-600 mb-6 italic text-sm md:text-base mt-2">
            Discover our handcrafted treasures, made with love and tradition in every stitch.
          </p>
        )}
      </div>

      {/* Category Chips */}
      <CategoryChips />

      {/* Top Control Bar */}
      <div className="collections-control-bar">
        <div className="collections-result-count">
          {sorted.length} {sorted.length === 1 ? "item" : "items"}
        </div>
        <div className="collections-controls-right">
          <button
            className="collections-filter-btn"
            onClick={() => setFiltersOpen(true)}
            aria-label="Open filters"
          >
            Filter
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="collections-sort-select"
            aria-label="Sort products"
          >
            <option value="default">Sort by: Recommended</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid - 2 columns on mobile */}
      {sorted.length === 0 ? (
        <div className="collections-empty">
          <p className="collections-empty-text">No products found matching your criteria</p>
          <button
            className="collections-empty-btn"
            onClick={handleResetFilters}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="plp-grid-mobile">
          {sorted.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      )}

      {/* Mobile Filters Bottom Sheet */}
      <BottomSheet
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
      >
        <div className="bottom-sheet-filters">
          <div className="filter-group">
            <label className="filter-group-label">Category</label>
            <div className="filter-options">
              <button
                className={`filter-option ${!category ? "active" : ""}`}
                onClick={() => setCategory(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-option ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="bottom-sheet-actions">
            <button
              className="bottom-sheet-btn-secondary"
              onClick={handleResetFilters}
            >
              Reset
            </button>
            <button
              className="bottom-sheet-btn-primary"
              onClick={handleApplyFilters}
            >
              Apply
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}


