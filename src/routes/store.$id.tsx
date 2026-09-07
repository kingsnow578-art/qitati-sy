import React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  MapPin,
  Phone,
  Star,
  MessageCircle,
  Package,
  BadgeCheck,
  Store as StoreIcon,
  Info,
  Loader2 as Loader2Icon,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  X,
  MapPinned,
  RefreshCcw,
  Globe,
  Send,
  Camera,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";

export const Route = createFileRoute("/store/$id")({
  component: StoreProfilePage,
});

function StoreHeaderSkeleton() {
  return (
    <div className="relative w-full animate-pulse">
      <div className="relative mb-20 w-full">
        <div className="h-44 w-full bg-slate-800 rounded-b-[3rem]" />
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 z-20">
          <div className="w-32 h-32 rounded-[2.5rem] border-[6px] border-[#0B1120] bg-slate-700" />
        </div>
      </div>
      <div className="flex flex-col items-center px-6 space-y-4">
        <div className="h-8 w-48 bg-slate-800 rounded-lg" />
        <div className="flex gap-3">
          <div className="h-6 w-24 bg-slate-800 rounded-full" />
          <div className="h-6 w-24 bg-slate-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function StorePageHeader({ store, ratingData }: { store: any; ratingData: any }) {
  return (
    <div className="relative w-full">
      <div className="relative mb-20 w-full">
        {/* Cover with Store Logo Blur */}
        <div className="h-44 w-full bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-950 rounded-b-[3rem] shadow-xl relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-[0.05] mix-blend-overlay" />
           {store?.logo_url && (
             <img
               src={supabase.storage.from("stores").getPublicUrl(store.logo_url).data.publicUrl}
               className="size-full object-cover opacity-20 blur-xl scale-150"
               alt=""
             />
           )}
        </div>

        {/* Logo/Avatar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 z-20">
          <div className="w-32 h-32 rounded-[2.5rem] border-[6px] border-[#0B1120] bg-[#0B1120] shadow-2xl overflow-hidden flex items-center justify-center group">
            {store?.logo_url ? (
              <img
                src={supabase.storage.from("stores").getPublicUrl(store.logo_url).data.publicUrl}
                className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={store.name}
              />
            ) : (
              <div className="size-full flex items-center justify-center text-4xl font-black text-primary bg-[#161B22]">
                {store?.name?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center px-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-2xl">
            {store?.name}
          </h1>
          <BadgeCheck className="size-6 text-blue-400 fill-blue-400/10 shadow-glow" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <span className="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
            <StoreIcon className="size-3" />
            متجر معتمد
          </span>
          <span className="bg-slate-800/80 text-slate-300 border border-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
            <MapPin className="size-3 text-primary" />
            {store?.region}
          </span>
        </div>

        {store?.detailed_address && (
          <div className="mt-4 flex items-center gap-2 bg-white/[0.02] px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner">
             <MapPinned className="size-3.5 text-primary animate-pulse" />
             <p className="text-[11px] text-slate-400 font-bold leading-none">{store.detailed_address}</p>
          </div>
        )}

        {ratingData?.count > 0 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3.5",
                    i < Math.round(ratingData.avg)
                      ? "fill-yellow-400 text-yellow-400 shadow-glow"
                      : "text-white/10",
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              ({ratingData.count} تقييم)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatExternalUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function getSocialLabel(platform?: string | null): string {
  switch (platform) {
    case "whatsapp":
      return "تواصل معنا عبر واتساب";
    case "facebook":
      return "صفحتنا على الفيس بوك";
    case "instagram":
      return "الانستاغرام الخاص بنا";
    case "telegram":
      return "قناتنا على تيليغرام";
    case "website":
      return "موقعنا الإلكتروني";
    default:
      return "تواصل عبر وسائل التواصل";
  }
}

function getSocialIcon(platform?: string | null) {
  switch (platform) {
    case "whatsapp":
      return <MessageCircle className="size-6 text-emerald-400" />;
    case "facebook":
      return <Globe className="size-6 text-blue-400" />;
    case "instagram":
      return <Camera className="size-6 text-pink-400" />;
    case "telegram":
      return <Send className="size-6 text-sky-400" />;
    case "website":
      return <Globe className="size-6 text-indigo-400" />;
    default:
      return <ExternalLink className="size-6 text-primary" />;
  }
}

function StoreProfilePage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();

  const { data: store, isLoading: loadingStore, error: storeError, refetch: refetchStore } = useQuery({
    queryKey: ["public-store-profile-v3", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    retry: 1,
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["store-products-v3", store?.owner_id],
    enabled: !!store?.owner_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", store!.owner_id)
        .in("status", ["published", "reserved"])
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: ratingData } = useQuery({
    queryKey: ["store-ratings-v3", store?.owner_id],
    enabled: !!store?.owner_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select(`*, profiles:user_id (full_name, avatar_url)`)
        .eq("seller_id", store!.owner_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const avg = data.length > 0 ? data.reduce((acc: any, curr: any) => acc + curr.stars, 0) / data.length : 0;
      return { avg, count: data.length, list: data };
    },
  });

  if (storeError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 text-center space-y-6">
        <div className="size-20 rounded-[2.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center">
           <ShieldAlert className="size-10 text-destructive" />
        </div>
        <div className="space-y-2">
           <h2 className="text-xl font-black text-white italic tracking-tighter">تعذر تحميل المتجر</h2>
           <p className="text-sm text-slate-500 font-medium">تأكد من اتصالك بالإنترنت وحاول مرة أخرى</p>
        </div>
        <button
          onClick={() => refetchStore()}
          className="press flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10"
        >
          <RefreshCcw className="size-4" /> إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40 animate-fade-in rtl text-right" dir="rtl">
      {/* Dynamic Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 px-6 py-8 flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="size-11 rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 press shadow-2xl"
        >
          <ArrowRight className="size-5" />
        </button>
        <div className="flex gap-3">
           <button
             onClick={() => toast.info("سيتم مراجعة المتجر من قبل الإدارة")}
             className="size-11 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 press shadow-2xl"
           >
             <ShieldAlert className="size-5 text-red-500" />
           </button>
        </div>
      </div>

      {loadingStore ? <StoreHeaderSkeleton /> : <StorePageHeader store={store} ratingData={ratingData} />}

      {/* Action Bar */}
      {(() => {
        const rawLink = store?.social_link || (store?.phone ? `https://wa.me/${store.phone.replace(/[^0-9]/g, "")}` : null);
        const socialUrl = formatExternalUrl(rawLink);
        const platform = store?.social_platform || (rawLink?.includes("wa.me") ? "whatsapp" : "website");

        return (
          <div className="px-6 mt-10 space-y-3">
            <a
              href={`tel:${store?.phone}`}
              className={cn(
                "press w-full bg-primary text-white h-16 rounded-[2rem] flex items-center justify-center gap-3 shadow-glow text-base font-black uppercase tracking-widest transition-all",
                loadingStore && "opacity-50 pointer-events-none"
              )}
            >
              <Phone className="size-6 text-white" />
              اتصال هاتفي بالمتجر
            </a>

            {/* DYNAMIC SOCIAL LINK BUTTON */}
            {socialUrl && (
              <a
                href={socialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="press w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 h-16 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl text-base font-black uppercase tracking-widest transition-all"
              >
                {getSocialIcon(platform)}
                <span>{getSocialLabel(platform)}</span>
                <ExternalLink className="size-4 text-slate-400" />
              </a>
            )}
          </div>
        );
      })()}

      {/* Description Section */}
      {(loadingStore || store?.description) && (
        <section className="mx-6 mt-10 p-6 bg-card border border-border rounded-[2.5rem] shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-glow" />
          <h2 className="text-lg font-black text-white italic tracking-tighter mb-4 flex items-center gap-3">
            حول المتجر
            <Info className="size-4 text-primary" />
          </h2>
          {loadingStore ? (
             <div className="space-y-2">
                <div className="h-4 w-full bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-slate-800 rounded animate-pulse" />
             </div>
          ) : (
            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line font-medium italic">
              {store.description}
            </p>
          )}
        </section>
      )}

      {/* Products Section */}
      <section className="mx-6 mt-12">
        <div className="flex items-center justify-between mb-8 px-2">
           <h2 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-3">
             المنتجات المتوفرة
             <Sparkles className="size-4 text-amber-500 fill-amber-500" />
           </h2>
           {!loadingProducts && (
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">
               {products?.length || 0} عنصر
             </span>
           )}
        </div>

        {loadingProducts || loadingStore ? (
          <div className="grid grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-5">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3.5rem] bg-card/30 animate-fade-in">
            <div className="size-20 rounded-full bg-slate-900 mx-auto mb-6 flex items-center justify-center border border-white/5 shadow-inner">
               <Package className="size-10 text-slate-700 opacity-40" />
            </div>
            <h3 className="text-base font-black text-slate-500 uppercase tracking-widest">لا توجد معروضات حالياً</h3>
            <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase tracking-widest">المتجر لم يقم بنشر أي قطع بعد</p>
          </div>
        )}
      </section>

      {/* Ratings Section */}
      {!loadingStore && (
        <section className="mx-6 mt-12 p-8 bg-card border border-border rounded-[2.5rem] shadow-premium relative overflow-hidden">
          <div className="absolute -top-12 -right-12 size-40 bg-primary/5 blur-3xl rounded-full" />
          <h2 className="text-xl font-black text-white italic tracking-tighter mb-10 flex items-center gap-3">
             آراء العملاء
             <CheckCircle2 className="size-4 text-emerald-500" />
          </h2>

          <div className="space-y-10 relative z-10">
            {ratingData?.list && ratingData.list.length > 0 ? (
              ratingData.list.map((r: any) => (
                <div key={r.id} className="pb-10 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/10 shadow-inner">
                        {(r.profiles as any)?.full_name?.charAt(0)}
                      </div>
                      <div>
                         <span className="text-sm font-black text-white">{(r.profiles as any)?.full_name}</span>
                         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{timeAgo(r.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 bg-black/20 p-1.5 rounded-lg border border-white/5 shadow-inner">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("size-2.5", i < r.stars ? "fill-yellow-400 text-yellow-400" : "text-white/10")} />
                      ))}
                    </div>
                  </div>
                  {r.review && (
                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5 shadow-inner">
                       <p className="text-xs text-slate-400 leading-relaxed font-medium italic">\"{r.review}\"</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center opacity-30">
                <Star className="size-14 mx-auto mb-5 text-slate-700" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">كن أول من يقيم هذا المتجر</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
