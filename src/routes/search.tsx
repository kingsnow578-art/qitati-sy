import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { fetchProducts } from "@/lib/products";
import { cn } from "@/lib/utils";

type SearchParams = {
  category?: string | undefined;
  city?: string | undefined;
  q?: string | undefined;
};

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    city: typeof search["city"] === "string" ? search["city"] : undefined,
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "البحث عن قطعة — قطعتي" },
      {
        name: "description",
        content: "ابحث وفلتر قطع الكمبيوتر حسب الفئة والمدينة والسعر والحالة على قطعتي.",
      },
      { property: "og:title", content: "البحث عن قطعة — قطعتي" },
      { property: "og:description", content: "فلاتر متقدمة للعثور على القطعة المناسبة بسرعة." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const initial = Route.useSearch();
  const [q, setQ] = useState(initial.q ?? "");
  const [category, setCategory] = useState(initial.category ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [condition, setCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filters = {
    ...(q ? { q } : {}),
    ...(category ? { category } : {}),
    ...(city ? { city } : {}),
    ...(condition ? { condition } : {}),
    ...(minPrice ? { minPrice: Number(minPrice) } : {}),
    ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
  };

  const results = useQuery({
    queryKey: ["products", "search", filters],
    queryFn: () => fetchProducts(filters, 50),
  });

  const activeCount = Object.keys(filters).length - (q ? 1 : 0);

  return (
    <div className="animate-fade-in">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-surface-2 px-3 py-2.5">
            <Search className="size-4 text-primary" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن قطعة..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="مسح">
                <X className="size-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-label="الفلاتر"
            className={cn(
              "press relative flex size-11 items-center justify-center rounded-2xl border border-border",
              showFilters ? "bg-primary text-primary-foreground" : "bg-surface-2",
            )}
          >
            <SlidersHorizontal className="size-4" />
            {activeCount > 0 && (
              <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-gold-foreground">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="animate-slide-up mt-3 space-y-3 rounded-2xl bg-surface-2 p-3">
            <FilterRow label="الفئة">
              <Chips
                value={category}
                onChange={setCategory}
                options={CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))}
              />
            </FilterRow>
            <FilterRow label="المدينة">
              <Chips
                value={city}
                onChange={setCity}
                options={CITIES.map((c) => ({ value: c, label: c }))}
              />
            </FilterRow>
            <FilterRow label="الحالة">
              <Chips
                value={condition}
                onChange={setCondition}
                options={[
                  { value: "new", label: "جديد" },
                  { value: "used", label: "مستعمل" },
                ]}
              />
            </FilterRow>
            <FilterRow label="السعر ($)">
              <div className="flex gap-2">
                <input
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="من"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  inputMode="numeric"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="إلى"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </FilterRow>
            <button
              type="button"
              onClick={() => {
                setCategory("");
                setCity("");
                setCondition("");
                setMinPrice("");
                setMaxPrice("");
              }}
              className="press w-full rounded-xl border border-border bg-card py-2 text-sm font-semibold"
            >
              مسح الفلاتر
            </button>
          </div>
        )}
      </header>

      <div className="px-4 py-4">
        <p className="mb-3 text-xs text-muted-foreground">
          {results.data ? `${results.data.length} نتيجة` : "جاري البحث..."}
        </p>
        {results.isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : results.data && results.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {results.data.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            لا توجد نتائج مطابقة
          </div>
        )}
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Chips({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(value === o.value ? "" : o.value)}
          className={cn(
            "press shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold",
            value === o.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
