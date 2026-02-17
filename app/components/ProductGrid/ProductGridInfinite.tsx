"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { ProductGrid, ProductCardData } from "./ProductGrid";

type ProductGridInfiniteProps = {
  products: ProductCardData[];
  hasMore: boolean;
  isLoading?: boolean;
  onLoadMore: () => void;
  mode?: "infinite-scroll" | "button";
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
};

export function ProductGridInfinite({
  products,
  hasMore,
  isLoading,
  onLoadMore,
  mode = "infinite-scroll",
  columns,
}: ProductGridInfiniteProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // ✅ state به جای ref

  // ✅ safeLoadMore بدون ref در render
  const safeLoadMore = useCallback(() => {
    if (!hasMore || isLoading || isButtonDisabled) return;

    setIsButtonDisabled(true);

    timeoutRef.current = setTimeout(() => {
      setIsButtonDisabled(false);
    }, 1500);

    onLoadMore();
  }, [onLoadMore, hasMore, isLoading, isButtonDisabled]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ✅ IntersectionObserver
  useEffect(() => {
    if (mode !== "infinite-scroll" || !hasMore || isLoading || isButtonDisabled)
      return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          entry.intersectionRatio! > 0.25 &&
          !isButtonDisabled
        ) {
          safeLoadMore();
        }
      },
      {
        rootMargin: "50px 0px 0px 0px",
        threshold: 0.25,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [mode, hasMore, isLoading, isButtonDisabled, safeLoadMore]);

  return (
    <div className="space-y-6">
      <ProductGrid
        products={products}
        columns={columns}
        isLoading={isLoading && products.length === 0}
      />

      {/* Loading indicator */}
      {isLoading && products.length > 0 && (
        <div className="flex items-center justify-center py-12 gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-sm text-muted-foreground">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {/* Sentinel */}
      {mode === "infinite-scroll" && hasMore && (
        <div
          ref={sentinelRef}
          className="h-16 w-full flex items-center justify-center invisible"
          style={{ minHeight: "64px" }}
        />
      )}

      {/* Button mode - ✅ بدون ref */}
      {mode === "button" && hasMore && (
        <div className="flex justify-center pt-12">
          <button
            type="button"
            disabled={isButtonDisabled || isLoading || !hasMore}
            onClick={safeLoadMore}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border border-white border-t-transparent" />
                بارگذاری بیشتر
              </>
            ) : (
              "نمایش محصولات بیشتر"
            )}
          </button>
        </div>
      )}

      {/* End of list */}
      {!hasMore && products.length > 0 && (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-green-100 p-3 flex items-center justify-center text-green-600">
            ✅
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            همه محصولات بارگذاری شدند
          </p>
        </div>
      )}
    </div>
  );
}
