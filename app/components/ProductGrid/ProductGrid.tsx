import Image from "next/image";
import Link from "next/link";
import React from "react";

export type ProductCardData = {
  _id: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  badge?: "new" | "sale" | "bestseller";
};

type ProductGridProps = {
  products: ProductCardData[];
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  isLoading?: boolean;
  emptyMessage?: string;
  renderItem?: (product: ProductCardData) => React.ReactNode;
};

const defaultColumns = {
  base: 2,
  sm: 2,
  md: 3,
  lg: 4,
};

export function ProductGrid({
  products,
  columns = defaultColumns,
  isLoading,
  emptyMessage = "هیچ محصولی پیدا نشد.",
  renderItem,
}: ProductGridProps) {
  const gridCols = `
    grid 
    grid-cols-${columns.base ?? defaultColumns.base}
    sm:grid-cols-${columns.sm ?? defaultColumns.sm}
    md:grid-cols-${columns.md ?? defaultColumns.md}
    lg:grid-cols-${columns.lg ?? defaultColumns.lg}
  `;

  if (isLoading) {
    return (
      <div className={`${gridCols} gap-4`}>
        {Array.from({ length: columns.lg ?? defaultColumns.lg }).map((_, i) => (
          <div className="h-64 rounded-xl bg-muted animate-pulse" key={i}></div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`${gridCols} gap-4`}>
      {products.map((product) =>
        renderItem ? (
          <React.Fragment key={product._id}>
            {renderItem(product)}
          </React.Fragment>
        ) : (
          <DefaultProductCard key={product._id} product={product} />
        ),
      )}
    </div>
  );
}

// کارت پیش‌فرض محصول – می‌تونی بعداً سفارشی‌ترش کنی
function DefaultProductCard({ product }: { product: ProductCardData }) {
  const badgeMap: Record<string, string> = {
    new: "جدید",
    sale: "تخفیف",
    bestseller: "پرفروش",
  };
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-background transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          priority={false}
        />

        {product.badge && (
          <span
            className="absolute left-2 top-2 rounded-full bg-pink-500 px-2 py-0.5 text-xs font-medium text-white"
            aria-label={badgeMap[product.badge]}
          >
            {badgeMap[product.badge]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 py-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">
          {product.title}
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold text-foreground">
            {product.price.toLocaleString("fa-IR")} تومان
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {product.compareAtPrice.toLocaleString("fa-IR")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
