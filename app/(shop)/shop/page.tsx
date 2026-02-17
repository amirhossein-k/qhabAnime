// app/(shop)/shop/page.tsx – Server Component

import React, { Suspense } from "react";
import { ShopGrid } from "./ShopGrid";

export default function ShopPage() {
  return (
    <main className="container mx-auto px-4 py-4">
      <div className="mb-8 flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">قاب‌های انیمه</h1>
        <span className="text-sm text-muted-foreground">
          بیش از ۲۰۰+ طرح خاص
        </span>
      </div>{" "}
      <Suspense fallback={<div>در حال بارگذاری...</div>}>
        <ShopGrid />
      </Suspense>
    </main>
  );
}
