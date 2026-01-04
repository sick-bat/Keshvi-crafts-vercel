// app/collections/CollectionsContent.tsx
"use client";

import products from "@/data/products.json";
import ProductCard from "@/components/ProductCard";
import BottomSheet from "@/components/BottomSheet";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type SortOption = "newest" | "price-low" | "price-high" | "popular";

export default function CollectionsContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [category, setCategory] = useState<string | null>(categoryFilter);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter out variants - only show parent products
  const live = (products as any[]).filter(
    (p: any) => (p.status ?? "live") !== "hidden" && !p.variants // Hide products that are variants
  );

  // Get unique categories
  const categories = Array.from(
    new Set(live.map((p: any) => p.category).filter(Boolean))
  ) as string[];

  // Filter by category
  const filtered = useMemo(() => {
    let result = live;
    if (category) {
      result = result.filter((p: any) => p.category === category);
    }
    return result;
  }, [live, category]);

  // Sort products
  const sorted = useMemo(() => {
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "popular":
        return sorted.sort((a, b) => {
          const aPopular = a.badge === "Bestseller" ? 1 : 0;
          const bPopular = b.badge === "Bestseller" ? 1 : 0;
          return bPopular - aPopular;
        });
      case "newest":
      default:
        return sorted.sort((a, b) => {
          const aNew = a.badge === "New" ? 1 : 0;
          const bNew = b.badge === "New" ? 1 : 0;
          return bNew - aNew;
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

  return (
    <>
      {/* Header */}
      <div className="collections-header">
        <h1 className="collections-title">
          {category ? `${category} Collection` : "All Collections"}
        </h1>
      </div>

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
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid - 2 columns on mobile */}
      {sorted.length === 0 ? (
        <div className="collections-empty">
          <p className="collections-empty-text">No products found</p>
          <button
            className="collections-empty-btn"
            onClick={handleResetFilters}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="plp-grid-mobile">
          {sorted.map((p: any) => (
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

