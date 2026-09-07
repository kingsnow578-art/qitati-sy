import { Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Sparkles, Store } from "lucide-react";
import { StorageImage } from "@/components/StorageImage";
import { CONDITION_LABEL, categoryName } from "@/lib/constants";
import { formatPrice, timeAgo } from "@/lib/format";
import { FavoriteButton } from "@/components/FavoriteButton";
import { cn } from "@/lib/utils";
import { memo } from "react";

export type ProductCardData = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  condition: string;
  category: string;
  images: string[];
  is_featured: boolean;
  is_shop?: boolean;
  created_at: string;
  status?: string;
  quantity?: number;
};

function ProductCardComponent({
  product,
  index = 0,
  wide = false,
  eager = false,
  noLink = false,
}: {
  product: ProductCardData;
  index?: number;
  wide?: boolean;
  eager?: boolean;
  noLink?: boolean;
}) {
  const navigate = useNavigate();

  // RAW STOCK DIRECTLY FROM PRODUCTS TABLE (NO PENDING DEDUCTIONS)
  const availableStock = product.quantity ?? 1;
  const isFullyReserved = product.status === 'reserved' || (availableStock === 0 && product.status !== 'sold');

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if the user clicked the FavoriteButton
    if ((e.target as HTMLElement).closest('.favorite-button-container')) {
      return;
    }
    if (!noLink) {
      navigate({ to: "/product/$id", params: { id: product.id } });
    }
  };

  const className = cn(
    "animate-fade-up press group relative block overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-card transition-all duration-500 hover:border-primary/30 active:scale-95 cursor-pointer z-50",
    wide ? "w-44 shrink-0" : "w-full",
  );

  return (
    <div
      onClick={handleCardClick}
      style={{ animationDelay: `${Math.min(index, 4) * 50}ms` }}
      className={className}
    >
      <div className="relative aspect-[1.15] overflow-hidden">
        <StorageImage
          path={product.images?.[0] ?? null}
          alt={product.title}
          eager={eager}
          className="size-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        {/* Tech Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Quality Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-2">
          {isFullyReserved && (
            <div className="bg-amber-500 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg border border-white/20 animate-pulse">
              محجوز
            </div>
          )}
          {product.is_featured ? (
            <div className="flex items-center gap-1 bg-amber-500 text-white text-[7px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-md border border-white/20">
              <Sparkles className="size-2" /> Featured
            </div>
          ) : (
            <div className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[7px] font-black text-white/80 uppercase">
              {CONDITION_LABEL[product.condition] ?? product.condition}
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 z-20 favorite-button-container">
          <FavoriteButton productId={product.id} />
        </div>
      </div>

      <div className="p-3 space-y-1.5 relative bg-gradient-to-b from-transparent to-black/20 pointer-events-none">
        <h3 className="line-clamp-1 text-xs font-black text-white/90 group-hover:text-primary transition-colors leading-tight">
          {product.title}
        </h3>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-primary tracking-tight">
              {formatPrice(Number(product.price), product.currency)}
            </p>
            {product.is_shop && (
              <div className="size-4 rounded-md bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Store className="size-2.5 text-blue-400" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between opacity-60">
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 min-w-0">
              <MapPin className="size-2 text-primary shrink-0" />
              <span className="truncate uppercase tracking-tighter">{product.city}</span>
            </div>
            <span className="text-[7px] font-black text-primary uppercase tracking-tighter shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">
              المتاح: {availableStock}
            </span>
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter shrink-0">
              {categoryName(product.category)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardComponent);

export function ProductCardSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={cn(
        "shadow-card overflow-hidden rounded-[2rem] border border-border bg-card",
        wide ? "w-44 shrink-0" : "w-full",
      )}
    >
      <div className="skeleton-shimmer aspect-[1.1] w-full" />
      <div className="space-y-2 p-3">
        <div className="skeleton-shimmer h-3 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-1/2 rounded" />
      </div>
    </div>
  );
}
