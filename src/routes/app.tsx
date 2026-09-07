import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Sparkles,
  Cpu,
  Megaphone,
  Package,
  MapPin,
  Loader2,
  Clock,
  ArrowDown,
  Bell,
  Store,
  Component,
  CircuitBoard,
  HardDrive,
  Microchip,
  Monitor,
  PlugZap,
  Headphones,
  Wrench,
  Server,
  ChevronLeft,
  MonitorSmartphone,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { CATEGORIES, categoryName } from "@/lib/constants";
import { fetchProducts, fetchSponsored, fetchAnnouncements, fetchPromoted } from "@/lib/products";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { StorageImage } from "@/components/StorageImage";
import { supabase } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/format";
import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useAppLoading } from "@/context/AppLoadingContext";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "قطعتي — سوق قطع الكمبيوتر في سوريا" },
      {
        name: "description",
        content:
          "تسوّق كروت شاشة، معالجات، رامات، هاردات و SSD مستعملة وجديدة في دمشق وكل سوريا على قطعتي.",
      },
      { property: "og:title", content: "قطعتي — سوق قطع الكمبيوتر في سوريا" },
      {
        property: "og:description",
        content: "بيع واشتري قطع الكمبيوتر بثقة في سوريا. إعلانات مجانية وصور حقيقية.",
      },
    ],
  }),
  component: HomePage,
});

// --- Background Animation Component ---

const NetworkBackground = memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-background">
      {/* CSS-only technical grid to avoid external image loading on mount */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Static scan line effect */}
      <div className="absolute inset-0 bg-scanline opacity-[0.01]" />

      {/* Premium Ambient Light - Simplified for mobile performance */}
      <div className="absolute -top-[10%] -left-[10%] size-[80%] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute -bottom-[10%] left-[20%] size-[70%] rounded-full bg-indigo-600/5 blur-[120px]" />
    </div>
  );
});

// --- Optimized Child Components ---

const SectionTitle = memo(({ title, icon }: { title: string; icon: React.ReactNode }) => {
  return (
    <div className="mb-4 flex items-center gap-2.5 px-1">
      <div className="size-1.5 bg-primary rounded-full animate-pulse shrink-0" />
      {icon}
      <h2 className="text-base font-black text-foreground tracking-tight">{title}</h2>
    </div>
  );
});

const FeaturedStoreCard = memo(({ p }: { p: any }) => {
  const imageUrl = useMemo(() => {
    if (p.stores?.logo_url) {
      return supabase.storage.from("stores").getPublicUrl(p.stores.logo_url).data.publicUrl;
    }
    if (p.stores?.profiles?.avatar_url) {
      return supabase.storage.from("profile-images").getPublicUrl(p.stores.profiles.avatar_url).data
        .publicUrl;
    }
    return null;
  }, [p.stores?.logo_url, p.stores?.profiles?.avatar_url]);

  return (
    <div className="relative h-56 sm:h-64 min-w-0 flex-[0_0_100%] py-3">
      <Link
        to="/store/$id"
        params={{ id: p.stores?.id }}
        className="block h-full mx-2 rounded-[2.5rem] border border-border shadow-premium group overflow-hidden relative transition-all duration-700 active:scale-[0.98] bg-card"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            className="size-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
            alt={p.stores?.name}
            loading="lazy"
          />
        ) : (
          <div className="size-full bg-blue-950 flex items-center justify-center">
            <Store className="size-14 text-white/10 animate-pulse" />
          </div>
        )}

        {/* Glossy Overlay - Exactly as Ad card */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#02040a] via-transparent to-white/5 opacity-40 group-hover:opacity-20 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/40 to-transparent" />

        {/* Sponsored Badge - Top Right as requested and consistent with Ads */}
        <div className="absolute top-5 right-6 z-20">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[8px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 uppercase tracking-[0.15em] border border-white/20 animate-fade-in">
            <Sparkles className="size-3 fill-black/20 animate-pulse" /> ممول
          </div>
        </div>

        <div className="absolute bottom-8 left-8 right-8 text-white z-20 transform group-hover:translate-y-[-4px] transition-transform duration-500">
          <div className="mb-3 animate-fade-up">
            <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-xs font-black border border-white/10 inline-block tracking-widest uppercase">
              Official Store
            </span>
          </div>
          <h3 className="font-black tracking-tight drop-shadow-2xl line-clamp-1 text-white leading-tight animate-fade-up text-xl sm:text-2xl">
            {p.stores?.name}
          </h3>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[10px] font-black opacity-80 uppercase tracking-widest text-white animate-fade-up animation-delay-200">
            <span className="flex items-center gap-2 drop-shadow-md">
              <MapPin className="size-3 text-primary shadow-glow" /> {p.stores?.region}
            </span>
            <span className="flex items-center gap-2 drop-shadow-md">
              <Store className="size-3 text-primary shadow-glow" /> متجر معتمد
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
});

const PromotedStoresCarousel = memo(({ stores, t }: { stores: any[]; t: any }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: "rtl" });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (emblaApi) emblaApi.scrollNext();
    }, 4000);
  }, [emblaApi]);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    startAutoplay();
    return () => stopAutoplay();
  }, [emblaApi, startAutoplay, stopAutoplay]);

  const carouselItems = useMemo(() => {
    return [...(stores || []), { id: "cta-banner", isCTA: true }];
  }, [stores]);

  return (
    <section className="mt-8 mb-10">
      <div className="px-4">
        <SectionTitle icon={<Sparkles className="size-4 text-gold" />} title="متاجر مميزة" />
      </div>

      <div className="overflow-hidden px-2 sm:px-4" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {carouselItems.map((item, i) =>
            (item as any).isCTA ? (
              <div key="cta-banner" className="relative h-56 sm:h-64 min-w-0 flex-[0_0_100%] py-3">
                <Link
                  to="/my-store"
                  className="block h-full mx-2 rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 shadow-glow text-center relative overflow-hidden group transition-all duration-700 active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 mix-blend-overlay" />
                  <div className="relative z-10 flex h-full flex-col items-center justify-center p-8">
                    <div className="size-16 rounded-full bg-white/20 flex items-center justify-center mb-4 border border-white/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                      <Store className="size-8 text-white animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">
                      أنشئ متجرك الممول!
                    </h3>
                    <p className="text-[10px] text-white/90 font-black uppercase tracking-[0.2em]">
                      Join our network of elite merchants
                    </p>
                  </div>
                  <div className="absolute -bottom-12 -left-12 size-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                </Link>
              </div>
            ) : (
              <FeaturedStoreCard key={`${(item as any).id}-${i}`} p={item} />
            ),
          )}
        </div>
      </div>
    </section>
  );
});

const HomeHeader = memo(
  ({ onSearchClick, user, t }: { onSearchClick: () => void; user: any; t: any }) => (
    <header className="bg-card text-foreground relative overflow-hidden rounded-b-[3.5rem] px-4 pt-8 pb-14 shadow-lg transition-colors duration-300">
      {/* Decorative Elements - Simplified */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10 mb-8">
        <div className="flex items-center gap-4 min-w-0 animate-fade-in flex-1">
          <div className="size-14 sm:size-18 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 animate-logo-entrance transition-transform hover:scale-105 duration-500">
            <img
              src={logo}
              alt="قطعتي"
              className="size-10 sm:size-12 object-contain shadow-lg"
              loading="eager"
            />
          </div>
          <div className="flex flex-col justify-center min-w-0 overflow-visible">
            <h1 className="text-3xl sm:text-4xl font-black drop-shadow-2xl leading-none">قطعتي</h1>
            <p className="text-[8px] sm:text-[9px] font-bold text-primary uppercase tracking-[0.2em] opacity-80 mt-1 pl-0.5">
              Hardware Hub
            </p>
          </div>
        </div>

        {user && (
          <Link
            to="/notifications"
            className="press size-11 rounded-2xl bg-surface-2 flex items-center justify-center border border-border shadow-md relative shrink-0 transition-all hover:bg-primary/10 ml-4"
          >
            <Bell className="size-5 text-primary" />
            <NotificationBadge userId={user.id} />
          </Link>
        )}
      </div>

      <div className="relative z-10 group" onClick={onSearchClick}>
        <button
          type="button"
          className="relative flex w-full items-center gap-4 rounded-2xl bg-surface-2 px-6 py-4 text-right text-sm text-muted-foreground border border-border shadow-md transition-all group-hover:border-primary/50 group-active:scale-[0.98]"
        >
          <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
            <Search className="size-4 animate-pulse" />
          </div>
          <span className="font-extrabold tracking-tight truncate opacity-80 group-hover:opacity-100 transition-opacity">
            {t("search_placeholder")}
          </span>
        </button>
      </div>
    </header>
  ),
);

const NotificationBadge = memo(({ userId }: { userId: string }) => {
  const { data } = useQuery({
    queryKey: ["unread-notifications-count", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      return count || 0;
    },
    staleTime: 1000 * 30,
  });
  if (!data || data === 0) return null;
  return (
    <div className="absolute -top-1 -left-1 size-5 bg-destructive text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#040712] animate-pop shadow-lg">
      {data > 9 ? "9+" : data}
    </div>
  );
});

const CategoryIcon = ({ slug, className }: { slug: string; className?: string }) => {
  switch (slug) {
    case "gpu":
      return <Component className={cn("w-8 h-8 text-purple-400 shrink-0", className)} />;
    case "full-cases":
      return <MonitorSmartphone className={cn("w-8 h-8 text-amber-400 shrink-0", className)} />;
    case "cpu":
      return <Cpu className={cn("w-8 h-8 text-cyan-400 shrink-0", className)} />;
    case "ram":
      return <CircuitBoard className={cn("w-8 h-8 text-emerald-400 shrink-0", className)} />;
    case "storage":
      return <HardDrive className={cn("w-8 h-8 text-orange-400 shrink-0", className)} />;
    case "motherboard":
      return <Microchip className={cn("w-8 h-8 text-rose-400 shrink-0", className)} />;
    case "monitor":
      return <Monitor className={cn("w-8 h-8 text-sky-400 shrink-0", className)} />;
    case "psu":
      return <PlugZap className={cn("w-8 h-8 text-yellow-400 shrink-0", className)} />;
    case "accessories":
      return <Headphones className={cn("w-8 h-8 text-pink-400 shrink-0", className)} />;
    case "gaming":
      return <Wrench className={cn("w-8 h-8 text-gray-400 shrink-0", className)} />;
    case "case":
      return <Server className={cn("w-8 h-8 text-indigo-400 shrink-0", className)} />;
    default:
      return <Package className={cn("w-8 h-8 text-slate-400 shrink-0", className)} />;
  }
};

const CategoriesSection = memo(({ categories, t }: { categories: any[]; t: any }) => (
  <section className="-mt-8 sm:-mt-10 px-4 relative z-20">
    <div className="shadow-lg no-scrollbar flex gap-4 overflow-x-auto rounded-[1.5rem] sm:rounded-[2rem] border border-border bg-card p-5 transition-colors duration-300">
      {/* Special Stores Link */}
      <Link
        to="/stores"
        className="press flex w-24 h-24 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl bg-primary/5 border border-primary/10 transition-all hover:bg-primary/10 group"
      >
        <div className="transition-transform group-hover:scale-110 flex items-center justify-center">
          <Store className="w-8 h-8 text-primary shrink-0" />
        </div>
        <span className="text-center text-[10px] font-black text-primary uppercase tracking-widest leading-none">
          Stores
        </span>
      </Link>

      {categories.map((c) => (
        <Link
          key={c.slug}
          to="/search"
          search={{ category: c.slug }}
          className="press flex w-24 h-24 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl bg-surface-2 border border-border transition-all hover:bg-primary/5 group"
        >
          <div className="transition-transform group-hover:scale-110 flex items-center justify-center">
            <CategoryIcon slug={c.slug} />
          </div>
          <span className="text-center text-[10px] font-black text-foreground uppercase tracking-widest leading-none truncate w-full px-1">
            {c.name}
          </span>
        </Link>
      ))}
    </div>
  </section>
));

const FeaturedAdCard = memo(({ p }: { p: any }) => {
  const imageUrl = useMemo(() => {
    if (!p.image_url && (!p.images || p.images.length === 0)) return null;
    if (p.isAnnouncement) return p.image_url;
    return supabase.storage.from("product-images").getPublicUrl(p.images[0]).data.publicUrl;
  }, [p.isAnnouncement, p.image_url, p.images]);

  return (
    <div className="relative h-56 sm:h-64 min-w-0 flex-[0_0_100%] py-3">
      <Link
        to={p.isAnnouncement ? (p.button_link as any) || "/" : ("/product/$id" as any)}
        params={(!p.isAnnouncement ? { id: p.id } : undefined) as any}
        className="block h-full mx-2 rounded-[2.5rem] border border-border shadow-premium group overflow-hidden relative transition-all duration-700 active:scale-[0.98] bg-card"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            className="size-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
            alt={p.title}
            loading="lazy"
          />
        ) : (
          <div className="size-full bg-surface-2 flex items-center justify-center">
            <Package className="size-14 text-muted-foreground animate-pulse" />
          </div>
        )}

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#02040a] via-transparent to-white/5 opacity-40 group-hover:opacity-20 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/40 to-transparent" />

        <div className="absolute top-5 right-6 z-20">
          {p.isAnnouncement ? (
            <div className="bg-blue-600 text-white text-[8px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 uppercase tracking-[0.15em] border border-white/20 animate-fade-in">
              <Megaphone className="size-3 fill-white/20" /> News
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[8px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 uppercase tracking-[0.15em] border border-white/20 animate-fade-in">
              <Sparkles className="size-3 fill-black/20 animate-pulse" /> ممول
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-8 right-8 text-white z-20 transform group-hover:translate-y-[-4px] transition-transform duration-500">
          {!p.isAnnouncement && (
            <div className="mb-3 animate-fade-up">
              <span className="bg-primary text-white px-4 py-1.5 rounded-xl text-sm font-black shadow-glow border border-white/10 inline-block tracking-tighter">
                {formatPrice(p.price, p.currency)}
              </span>
            </div>
          )}
          <h3
            className={cn(
              "font-black tracking-tight drop-shadow-2xl line-clamp-1 text-white leading-tight animate-fade-up",
              p.isAnnouncement ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
            )}
          >
            {p.title}
          </h3>

          {p.isAnnouncement ? (
            <p className="text-xs text-slate-300 line-clamp-1 mt-2 font-bold opacity-80 animate-fade-up animation-delay-200">
              {p.description}
            </p>
          ) : (
            <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[10px] font-black opacity-80 uppercase tracking-widest text-white animate-fade-up animation-delay-200">
              <span className="flex items-center gap-2 drop-shadow-md">
                <MapPin className="size-3 text-primary shadow-glow" /> {p.city}
              </span>
              <span className="flex items-center gap-2 drop-shadow-md">
                <Cpu className="size-3 text-primary shadow-glow" /> {categoryName(p.category)}
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
});

const FeaturedAdsSlider = memo(({ ads, t }: { ads: any[]; t: any }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: "rtl" });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (emblaApi) emblaApi.scrollNext();
    }, 4000);
  }, [emblaApi]);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    startAutoplay();
    return () => stopAutoplay();
  }, [emblaApi, startAutoplay, stopAutoplay]);

  return (
    <section className="mt-8 mb-10 overflow-hidden">
      <div className="px-4">
        <SectionTitle icon={<Sparkles className="size-4 text-gold" />} title={t("featured_ads")} />
      </div>
      <div className="overflow-hidden px-2 sm:px-4" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {ads.map((p, i) => (
            <FeaturedAdCard key={`${p.id}-${i}`} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
});

const HorizontalCategorySection = memo(({
  slug,
  name,
  items,
}: {
  slug: string;
  name: string;
  items: any[];
}) => {
  return (
    <div className="space-y-3 my-6">
      {/* Category Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <CategoryIcon slug={slug} className="size-6 shrink-0 text-primary" />
          <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight italic">
            {name}
          </h2>
          <span className="text-[10px] font-extrabold text-slate-500 bg-surface-2 border border-border px-2.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>

        <Link
          to="/search"
          search={{ category: slug }}
          className="press flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/20 transition-colors"
        >
          <span>عرض الكل</span>
          <ChevronLeft className="size-3" />
        </Link>
      </div>

      {/* Horizontal Scrollable Container (Carousel) */}
      <div
        className="flex overflow-x-auto gap-4 pb-4 pt-1 px-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <div key={item.id} className="w-64 flex-none snap-start">
            <ProductCard product={item} index={i} eager={i < 2} />
          </div>
        ))}
      </div>
    </div>
  );
});

const LatestSection = memo(
  ({
    products,
    requests,
    isLoading,
    activeTab,
    displayCategories,
    t
  }: {
    products: any[];
    requests: any[];
    isLoading: boolean;
    activeTab: 'sale' | 'buy';
    displayCategories: any[];
    t: any
  }) => {
    // Dynamically group products by category
    const groupedCategories = useMemo(() => {
      if (!products || products.length === 0) return [];

      const categoryMap = new Map<string, any[]>();

      products.forEach((product: any) => {
        const cat = product.category || "other";
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, []);
        }
        categoryMap.get(cat)!.push(product);
      });

      const list: { categoryName: string; items: any[] }[] = [];

      displayCategories.forEach((catObj) => {
        const items = categoryMap.get(catObj.slug);
        if (items && items.length > 0) {
          list.push({
            categoryName: catObj.name || categoryName(catObj.slug),
            items,
          });
          categoryMap.delete(catObj.slug);
        }
      });

      categoryMap.forEach((items, slug) => {
        if (items.length > 0) {
          list.push({
            categoryName: categoryName(slug) || slug,
            items,
          });
        }
      });

      return list;
    }, [products, displayCategories]);

    return (
      <section className="mt-8 px-4 pb-20 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <SectionTitle
            icon={activeTab === 'sale' ? <Cpu className="size-4 text-primary" /> : <Package className="size-4 text-emerald-500" />}
            title={activeTab === 'sale' ? t("latest_products") : "طلبات الشراء الأخيرة"}
          />
          <Link to={activeTab === 'sale' ? "/sell" : "/requests/new"} className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
            {activeTab === 'sale' ? "أضف قطعة" : "أضف طلب"}
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((s) => (
              <div key={s} className="space-y-3">
                <div className="h-6 w-36 bg-surface-2 rounded-lg animate-pulse" />
                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-52 shrink-0">
                      <ProductCardSkeleton />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'sale' ? (
          groupedCategories.length > 0 ? (
            <div className="flex flex-col gap-6">
              {groupedCategories.map((group) => (
                <div key={group.categoryName} className="space-y-2">
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-sm sm:text-base font-black text-foreground italic tracking-tight">{group.categoryName}</h2>
                    <span className="text-[10px] font-extrabold text-slate-500 bg-surface-2 border border-border px-2.5 py-0.5 rounded-full">
                      {group.items.length}
                    </span>
                  </div>
                  <div
                    className="flex overflow-x-auto gap-3.5 px-4 pb-3 pt-1 snap-x snap-mandatory no-scrollbar"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {group.items.map((item) => (
                      <div key={item.id} className="w-44 sm:w-48 shrink-0 snap-start">
                        <ProductCard product={item} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-border bg-surface-2 p-12 text-center shadow-inner">
              <Package className="size-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                لا توجد قطع معروضة حالياً
              </p>
            </div>
          )
        ) : (
          requests.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {requests.map((req, i) => (
                <RequestCard key={req.id} req={req} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-border bg-surface-2 p-12 text-center shadow-inner">
              <Package className="size-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                لا توجد طلبات حالياً
              </p>
            </div>
          )
        )}
      </section>
    );
  }
);

const RequestCard = memo(function RequestCard({
  req,
  index = 0,
}: {
  req: any;
  index?: number;
}) {
  const navigate = useNavigate();

  const displayPrice = req.max_price
    ? `${req.max_price} $`
    : "حسب الاتفاق";

  const handleCardClick = () => {
    navigate({ to: "/requests/$id", params: { id: req.id } });
  };

  return (
    <div
      onClick={handleCardClick}
      style={{ animationDelay: `${Math.min(index, 4) * 50}ms` }}
      className="animate-fade-up press group relative block overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-card transition-all duration-500 hover:border-primary/30 active:scale-95 cursor-pointer z-50 w-full"
    >
      <div className="relative aspect-[1.15] overflow-hidden">
        {req.image_url ? (
          <StorageImage
            path={req.image_url}
            bucket="request-images"
            alt={req.title}
            className="size-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="size-full bg-slate-800 flex items-center justify-center text-slate-700">
            <Package className="size-12 opacity-20" />
          </div>
        )}

        {/* Tech Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Request Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-2">
          <div className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg border border-white/20">
            طلب شراء
          </div>
          {req.item_condition && (
            <div className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[7px] font-black text-white/80 uppercase">
              {req.item_condition === 'new' ? 'جديدة' : 'مستعملة'}
            </div>
          )}
        </div>
      </div>

      <div className="p-3.5 space-y-2 relative bg-gradient-to-b from-transparent to-black/20 pointer-events-none">
        <h3 className="line-clamp-1 text-[13px] font-bold text-white/90 group-hover:text-primary transition-colors leading-tight">
          {req.title}
        </h3>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-primary tracking-tight">
              {displayPrice}
            </p>
          </div>

          <div className="flex items-center justify-between opacity-60">
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 min-w-0">
              <MapPin className="size-2 text-primary shrink-0" />
              <span className="truncate uppercase tracking-tighter">{req.city}</span>
            </div>
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter shrink-0">
              {categoryName(req.category)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

function HomePage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { setIsAppLoading } = useAppLoading();
  const [activeTab, setActiveTab] = useState<'sale' | 'buy'>('sale');

  // Categories - longer stale time
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("priority", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 1 hour
  });

  // Sponsored and Announcements - staggered or combined if possible, but keeping separate for now with better staleTimes
  const sponsored = useQuery({
    queryKey: ["products", "sponsored"],
    queryFn: () => fetchSponsored(10),
    staleTime: 1000 * 60 * 15,
  });

  const announcements = useQuery({
    queryKey: ["announcements", "active"],
    queryFn: fetchAnnouncements,
    staleTime: 1000 * 60 * 30,
  });

  const promoted = useQuery({
    queryKey: ["products", "promoted"],
    queryFn: () => fetchPromoted(10),
    staleTime: 1000 * 60 * 15,
  });

  // Latest products - Load this only after critical metadata is ready to reduce concurrent processing
  const latest = useQuery({
    queryKey: ["products", "latest"],
    queryFn: () => fetchProducts({}, 100),
    staleTime: 1000 * 60 * 5,
    enabled: !categoriesQuery.isLoading, // Staggering
  });

  const promotedStores = useQuery({
    queryKey: ["promoted_stores_carousel_v3"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_promotions")
        .select(`*, stores (*, profiles:owner_id (avatar_url))`)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const partRequests = useQuery({
    queryKey: ["part_requests_home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("part_requests")
        .select(`*, profiles!user_id (full_name, avatar_url)`)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
    enabled: activeTab === 'buy',
  });

  const handleRefresh = useCallback(async () => {
    await Promise.allSettled([
      latest.refetch(),
      promoted.refetch(),
      sponsored.refetch(),
      announcements.refetch(),
      categoriesQuery.refetch(),
      promotedStores.refetch(),
      partRequests.refetch(),
    ]);
  }, [latest, promoted, sponsored, announcements, categoriesQuery, promotedStores, partRequests]);

  const onSearchClick = useCallback(() => navigate({ to: "/search" }), [navigate]);

  const displayCategories = useMemo(() => {
    const data =
      categoriesQuery.data && categoriesQuery.data.length > 0 ? categoriesQuery.data : CATEGORIES;

    // Ensure labels are English abbreviations as requested
    return data.map((c) => {
      const local = CATEGORIES.find((l) => l.slug === c.slug);
      return {
        ...c,
        name: local ? local.name : c.name,
      };
    });
  }, [categoriesQuery.data]);

  const allFeatured = useMemo(() => {
    const sponsoredAds = (sponsored.data || []).map((p) => ({ ...p, isAnnouncement: false }));
    const promotedAds = (promoted.data || []).map((p) => ({ ...p, isAnnouncement: false }));
    const generalAds = (announcements.data || []).map((a) => ({ ...a, isAnnouncement: true }));
    return [...generalAds, ...promotedAds, ...sponsoredAds];
  }, [sponsored.data, promoted.data, announcements.data]);

  const isInitialLoading = categoriesQuery.isLoading || (latest.isLoading && !latest.data);

  useEffect(() => {
    if (!isInitialLoading) {
      // Small delay to ensure render has happened
      const t = setTimeout(() => setIsAppLoading(false), 300);
      return () => clearTimeout(t);
    }
    return;
  }, [isInitialLoading, setIsAppLoading]);

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      className={cn("pb-10 select-none overflow-x-hidden", language === "ar" ? "rtl" : "ltr")}
    >
      <NetworkBackground />
      <HomeHeader onSearchClick={onSearchClick} user={user} t={t} />

      <div className="relative z-10 space-y-2">
        <CategoriesSection categories={displayCategories} t={t} />

        {/* Dual Feed Tab Switcher */}
        <div className="px-4 mt-8">
          <div className="bg-card border border-border p-1.5 rounded-[2rem] flex items-center shadow-premium relative overflow-hidden">
            <button
              onClick={() => setActiveTab('sale')}
              className={cn(
                "flex-1 py-3.5 rounded-[1.75rem] text-xs font-black uppercase tracking-widest transition-all duration-500 relative z-10",
                activeTab === 'sale' ? "text-white" : "text-slate-500"
              )}
            >
              قطع للبيع
            </button>
            <button
              onClick={() => setActiveTab('buy')}
              className={cn(
                "flex-1 py-3.5 rounded-[1.75rem] text-xs font-black uppercase tracking-widest transition-all duration-500 relative z-10",
                activeTab === 'buy' ? "text-white" : "text-slate-500"
              )}
            >
              طلبات شراء
            </button>

            {/* Animated Slider Background */}
            <div
              className={cn(
                "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-[1.75rem] shadow-glow transition-all duration-500 ease-out-expo",
                activeTab === 'sale' ? "right-1.5" : "right-[calc(50%-0px)]"
              )}
            />
          </div>
        </div>

        <PromotedStoresCarousel stores={promotedStores.data || []} t={t} />

        {allFeatured.length > 0 ? (
          <FeaturedAdsSlider ads={allFeatured} t={t} />
        ) : (
          <section className="mt-8 mb-10 px-4">
            <SectionTitle
              icon={<Sparkles className="size-4 text-gold" />}
              title={t("featured_ads")}
            />
            <Link
              to="/sell"
              className="press block p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-glow text-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 mix-blend-overlay" />
              <div className="relative z-10">
                <div className="size-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="size-8 text-white animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">
                  روّج لمنتجك هنا!
                </h3>
                <p className="text-[10px] text-white/90 font-black uppercase tracking-[0.2em]">
                  Boost Your Sales Instantly
                </p>
              </div>
              <div className="absolute -bottom-12 -left-12 size-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </Link>
          </section>
        )}

        <LatestSection
          products={latest.data || []}
          requests={partRequests.data || []}
          isLoading={activeTab === 'sale' ? latest.isLoading : partRequests.isLoading}
          activeTab={activeTab}
          displayCategories={displayCategories}
          t={t}
        />
      </div>
    </PullToRefresh>
  );
}

