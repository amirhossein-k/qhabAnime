// app/(shop)/shop/ShopGrid.tsx – Client Component برای مدیریت state
"use client";

import { ProductCardData } from "@/app/components/ProductGrid/ProductGrid";
import { ProductGridInfinite } from "@/app/components/ProductGrid/ProductGridInfinite";
import { useCallback, useEffect, useRef, useState } from "react";

export function ShopGrid() {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false); // جلوگیری از درخواست همزمان

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;

    // setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: "12",
        sort: "newest",
      });

      const res = await fetch(`/api/products?${params}`, {
        cache: "no-store", // از cache استفاده نکن
      });
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      setProducts((prev) => [...prev, ...data.items]);
      setPage((prev) => prev + 1);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [hasMore]);

  // بارگذاری اولیه
  useEffect(() => {
    if (products.length > 0) return; // جلوگیری از fetch دوباره در hot reload

    const fetchInitial = async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "12",
        sort: "newest",
      });

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();

      setProducts(data.items);
      setHasMore(data.pagination.hasMore);
    };

    fetchInitial();
  }, []);
  // IntersectionObserver اصلاح شده
  useEffect(() => {
    const node = observerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "100px", threshold: 0.1 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [loadMore]); // فقط loadMore

  return (
    <>
      <ProductGridInfinite
        products={products}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={loadMore}
        mode="infinite-scroll"
        columns={{ base: 2, sm: 2, md: 3, lg: 4 }}
      />

      {/* Sentinel element - حتماً ارتفاع مشخص داشته باشه */}
      {hasMore && (
        <div
          ref={observerRef}
          className="h-20 flex items-center justify-center"
          aria-hidden
        />
      )}
    </>
  );
}
