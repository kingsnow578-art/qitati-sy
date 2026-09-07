import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  MapPin,
  Phone,
  MessageCircle,
  Eye,
  Store,
  BadgeCheck,
  Trash2,
  ChevronLeft,
  Star,
  ShieldAlert,
  ShoppingBag,
  Clock,
  CheckCircle2,
  CirclePlus,
  Loader2,
  Package,
  Component,
  Cpu,
  CircuitBoard,
  HardDrive,
  Microchip,
  Monitor,
  PlugZap,
  Server,
  Headphones,
  Wrench,
  Edit,
  User,
  MonitorSmartphone,
  XCircle,
  MessageSquare,
  AlertCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { StorageImage } from "@/components/StorageImage";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CONDITION_LABEL, categoryName } from "@/lib/constants";
import { formatPrice, timeAgo } from "@/lib/format";
import { fetchProduct } from "@/lib/products";
import { supabase } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ensureOnline } from "@/lib/offline";
import { PushService } from "@/lib/push-service";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل القطعة — قطعتي" },
      { name: "description", content: "صور وتفاصيل القطعة ومعلومات البائع وطرق التواصل معه." },
      { property: "og:title", content: "تفاصيل القطعة — قطعتي" },
      { property: "og:description", content: "شاهد الصور والسعر والحالة وتواصل مع البائع مباشرة." },
    ],
  }),
  component: ProductPage,
});

type Seller = {
  id: string;
  full_name: string;
  phone: string;
  city: string;
  avatar_url: string | null;
  is_shop: boolean;
  shop_name: string | null;
  is_verified: boolean;
};

const CategoryIcon = ({ slug, className }: { slug: string; className?: string }) => {
  switch (slug) {
    case "gpu":
      return <Component className={cn("w-4 h-4 text-purple-400", className)} />;
    case "full-cases":
      return <MonitorSmartphone className={cn("w-4 h-4 text-amber-400", className)} />;
    case "cpu":
      return <Cpu className={cn("w-4 h-4 text-cyan-400", className)} />;
    case "ram":
      return <CircuitBoard className={cn("w-4 h-4 text-emerald-400", className)} />;
    case "storage":
      return <HardDrive className={cn("w-4 h-4 text-orange-400", className)} />;
    case "motherboard":
      return <Microchip className={cn("w-4 h-4 text-rose-400", className)} />;
    case "monitor":
      return <Monitor className={cn("w-4 h-4 text-sky-400", className)} />;
    case "psu":
      return <PlugZap className={cn("w-4 h-4 text-yellow-400", className)} />;
    case "accessories":
      return <Headphones className={cn("w-4 h-4 text-pink-400", className)} />;
    case "gaming":
      return <Wrench className={cn("w-4 h-4 text-gray-400", className)} />;
    case "case":
      return <Server className={cn("w-4 h-4 text-indigo-400", className)} />;
    default:
      return <Package className={cn("w-4 h-4 text-slate-400", className)} />;
  }
};

function ProductPage() {
  const { id } = Route.useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [active, setActive] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [myTimeLeft, setMyTimeLeft] = useState<string | null>(null);

  // Buyer Reservation Modal State
  const [showResModal, setShowResModal] = useState(false);
  const [resQty, setResQty] = useState(1);
  const [buyerNote, setBuyerNote] = useState("");

  // Seller Management Modal State
  const [showManageResModal, setShowManageResModal] = useState(false);

  // Seller Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingRes, setRejectingRes] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["product-v2", id, user?.id],
    queryFn: async () => {
       const product = await fetchProduct(id);
       if (!product) return null;

       const { data: store } = await supabase
         .from("stores")
         .select("id")
         .eq("owner_id", product.seller_id)
         .maybeSingle();

       // Fetch pending reservations (for buyer status and seller list)
       const { data: reservations } = await supabase
         .from("reservations")
         .select("id, quantity, requested_quantity, created_at, buyer_id, buyer_note")
         .eq("product_id", id)
         .eq("status", "pending")
         .order('created_at', { ascending: true });

       // STRICT RULE: RAW STOCK QUANTITY DIRECTLY FROM PRODUCTS TABLE
       const availableStock = product.quantity ?? 1;

       // Find earliest expiring reservation for timer
       const earliestRes = reservations?.[0] || null;

       // Find if CURRENT USER has an existing pending reservation
       const myRes = reservations?.find(r => r.buyer_id === user?.id) || null;

       return {
         ...product,
         store_id: store?.id || null,
         availableStock,
         earliestRes,
         myRes,
         allReservations: reservations || []
       };
    },
    staleTime: 1000 * 30, // 30s cache, driven by Realtime channel below
  });

  const isOwner = user?.id && data?.seller_id && user.id === data.seller_id;

  const { data: pendingReservations, isLoading: loadingPending } = useQuery({
    queryKey: ["pending-product-reservations", id],
    enabled: !!isOwner && showManageResModal,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          profiles:buyer_id (
            id,
            full_name,
            avatar_url,
            phone
          )
        `)
        .eq("product_id", id)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 15, // Driven by Realtime channel
  });

  // REALTIME LISTENERS REPLACING AGGRESSIVE POLLING (PERFORMANCE & CPU FIX)
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`realtime-product-page-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products", filter: `id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["product-v2", id] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations", filter: `product_id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["product-v2", id] });
          queryClient.invalidateQueries({ queryKey: ["pending-product-reservations", id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  // APPROVAL & AUTO-REJECTION (QUANTITY-BASED BATCH OPERATION)
  const approveReservation = useMutation({
    mutationFn: async (reservation: any) => {
      if (!ensureOnline()) throw new Error("offline");
      toast.loading("جاري معالجة الاعتماد وتخصيص الكمية...");

      const approvedQty = reservation.requested_quantity || reservation.quantity || 1;

      // 1. Try Batch RPC
      const { error: rpcError } = await supabase.rpc('approve_reservation_batch', {
        p_reservation_id: reservation.id,
        p_product_id: id
      });

      if (rpcError) {
        console.warn("RPC approve_reservation_batch failed, running manual client transaction fallback:", rpcError);

        // Fallback Client Logic:
        const currentStock = data?.quantity || 1;
        const newStock = Math.max(0, currentStock - approvedQty);

        // a) Approved reservation
        const { error: e1 } = await supabase
          .from("reservations")
          .update({ status: "approved" })
          .eq("id", reservation.id);
        if (e1) throw e1;

        // b) Main product status & remaining quantity
        const { error: e2 } = await supabase
          .from("products")
          .update({
            quantity: newStock,
            status: newStock === 0 ? "sold" : data?.status
          })
          .eq("id", id);
        if (e2) throw e2;

        // c) Auto-reject ONLY pending requests whose requested_quantity strictly exceeds newStock
        const { data: otherPending } = await supabase
          .from("reservations")
          .select("id, buyer_id, requested_quantity, quantity")
          .eq("product_id", id)
          .neq("id", reservation.id)
          .eq("status", "pending");

        if (otherPending && otherPending.length > 0) {
          const exceedingPending = otherPending.filter(r => (r.requested_quantity || r.quantity || 1) > newStock);

          for (const item of exceedingPending) {
            await supabase
              .from("reservations")
              .update({
                status: "auto_rejected",
                rejection_reason: newStock === 0 ? "تم حجز وبيع كامل الكمية المتاحة" : "الكمية المتبقية لا تكفي لتلبية طلبك"
              })
              .eq("id", item.id);

            await supabase.from("notifications").insert({
              user_id: item.buyer_id,
              title: "عذراً، تغيير في الكمية المتاحة",
              body: `تم تحديث الكمية المتاحة لـ ${data?.title || 'المنتج'} ولم تعد تكفي لطلبك`,
              type: "reservation_auto_rejected"
            });
          }
        }
      }
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("تمت الموافقة وتعديل مخزون المنتج بنجاح! 🎉");
      queryClient.invalidateQueries({ queryKey: ["product-v2", id] });
      queryClient.invalidateQueries({ queryKey: ["pending-product-reservations", id] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("فشل تأكيد الحجز: " + err.message);
    }
  });

  // SELLER REJECTION MUTATION
  const rejectReservation = useMutation({
    mutationFn: async () => {
      if (!ensureOnline()) throw new Error("offline");
      if (!rejectingRes) throw new Error("لم يتم تحديد الطلب");
      if (!rejectionReason.trim()) throw new Error("يرجى تحديد سبب الرفض أولاً");

      toast.loading("جاري رفض الطلب وإرسال التنبيه...");

      // 1. Update reservation
      const { error: updateError } = await supabase
        .from("reservations")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason.trim()
        })
        .eq("id", rejectingRes.id);

      if (updateError) throw updateError;

      // 2. In-App Notification to Buyer
      await supabase.from("notifications").insert({
        user_id: rejectingRes.buyer_id,
        title: "تم رفض طلب الحجز",
        body: `سبب الرفض لـ ${data?.title || 'القطعة'}: ${rejectionReason.trim()}`,
        type: "reservation_rejected"
      });

      // 3. Push Notification to Buyer
      await PushService.sendPushNotification(
        rejectingRes.buyer_id,
        "تم رفض طلب الحجز",
        `سبب الرفض لـ ${data?.title || 'القطعة'}: ${rejectionReason.trim()}`,
        { url: "/reservations" }
      );
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("تم رفض الطلب وإبلاغ المشتري بنجاح");
      setShowRejectModal(false);
      setRejectingRes(null);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["product-v2", id] });
      queryClient.invalidateQueries({ queryKey: ["pending-product-reservations", id] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("فشل العملية: " + err.message);
    }
  });

  // FIXED COUNTDOWN TIMER EFFECTS: PREVENT INFINITE REFETCH LOOPS (ERROR 3 FIX)
  useEffect(() => {
    if (!data?.myRes) {
      setMyTimeLeft(null);
      return;
    }

    let invalidated = false;
    const updateMyTimer = () => {
      const created = new Date(data.myRes!.created_at).getTime();
      const expires = created + (12 * 60 * 60 * 1000);
      const now = new Date().getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setMyTimeLeft(null);
        if (!invalidated) {
          invalidated = true;
          queryClient.invalidateQueries({ queryKey: ["product-v2", id] });
        }
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setMyTimeLeft(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    updateMyTimer();
    const timer = setInterval(updateMyTimer, 1000);
    return () => clearInterval(timer);
  }, [data?.myRes, id, queryClient]);

  useEffect(() => {
    if (!data?.earliestRes || data.availableStock > 0 || data.myRes) {
      setTimeLeft(null);
      return;
    }

    let invalidated = false;
    const updateTimer = () => {
      const created = new Date(data.earliestRes.created_at).getTime();
      const expires = created + (12 * 60 * 60 * 1000);
      const now = new Date().getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft(null);
        if (!invalidated) {
          invalidated = true;
          queryClient.invalidateQueries({ queryKey: ["product-v2", id] });
        }
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [data?.earliestRes, data?.availableStock, data?.myRes, id, queryClient]);

  useEffect(() => {
    if (id) {
      supabase.rpc("increment_product_views", { _product_id: id }).then(({ error }) => {
        if (error) console.warn("Failed to increment views:", error);
      });
    }
  }, [id]);

  const startConversation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("يرجى تسجيل الدخول أولاً");
      if (!data) throw new Error("بيانات المنتج غير متوفرة");

      const sellerObj = (data as any).profiles;
      if (!sellerObj) throw new Error("معلومات البائع غير متوفرة");
      if (user.id === sellerObj.id) throw new Error("لا يمكنك مراسلة نفسك");

      const { data: convs, error: fetchError } = await supabase
        .from("conversations")
        .select("id, buyer_id, seller_id")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (fetchError) throw fetchError;

      const existing = convs?.find(
        (c) =>
          (c.buyer_id === user.id && c.seller_id === sellerObj.id) ||
          (c.buyer_id === sellerObj.id && c.seller_id === user.id),
      );

      if (existing) return existing.id;

      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          buyer_id: user.id,
          seller_id: sellerObj.id,
          product_id: id,
        })
        .select("id")
        .maybeSingle();

      if (createError) throw createError;
      return newConv?.id;
    },
    onSuccess: (conversationId) => {
      if (conversationId) {
        navigate({ to: "/chat/$conversationId", params: { conversationId } });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "تعذّر فتح المحادثة");
    },
  });

  const handleStartChat = () => {
    if (ensureOnline()) {
      startConversation.mutate();
    }
  };

  const reportProduct = useMutation({
    mutationFn: async (reason: string) => {
      if (!ensureOnline()) throw new Error("offline");
      if (!user) throw new Error("يجب تسجيل الدخول");
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        target_type: "product",
        target_id: id,
        reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إرسال البلاغ بنجاح");
    },
  });

  // BUYER RESERVATION & NEGOTIATION SUBMISSION (MULTI-REQUEST SUPPORT)
  const reserveProduct = useMutation({
    mutationFn: async () => {
      if (!ensureOnline()) throw new Error("offline");
      if (!user) throw new Error("يرجى تسجيل الدخول أولاً");
      if (!resQty || resQty < 1) throw new Error("يرجى تحديد كمية صحيحة أولاً");
      if (!buyerNote.trim()) throw new Error("يرجى كتابة رسالة التفاوض أو الملاحظة للبائع أولاً");

      toast.loading("جاري إرسال طلب الحجز والتفاوض...");

      // Creates a separate, independent reservation document each submission
      const { data: newRes, error } = await supabase
        .from("reservations")
        .insert({
          product_id: id,
          buyer_id: user.id,
          quantity: resQty,
          requested_quantity: resQty,
          buyer_note: buyerNote.trim(),
          status: "pending"
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      // In-app notification for seller
      await supabase.from("notifications").insert({
        user_id: data.seller_id,
        title: "طلب حجز وتفاوض جديد 💬",
        body: `أرسل ${profile?.full_name || 'مشتري'} طلب حجز لـ (${resQty} قطعة) من ${data.title}: "${buyerNote.trim()}"`,
        type: "reservation_pending"
      });

      // Push notification for seller
      await PushService.sendPushNotification(
        data.seller_id,
        "طلب حجز وتفاوض جديد 💬",
        `أرسل ${profile?.full_name || 'مشتري'} طلب حجز لـ (${resQty} قطعة) من ${data.title}: "${buyerNote.trim()}"`,
        { url: `/product/${id}` }
      );

      return newRes?.id;
    },
    onSuccess: async () => {
      toast.dismiss();
      toast.success("تم إرسال طلب الحجز والتفاوض بنجاح! 🎉");
      setShowResModal(false);
      setBuyerNote("");
      queryClient.invalidateQueries({ queryKey: ["product-v2", id] });
      navigate({ to: "/reservations" });
    },
    onError: (error: any) => {
      toast.dismiss();
      toast.error("فشل الحجز: " + error.message);
    },
  });

  async function removeListing() {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان نهائياً؟")) return;
    try {
      toast.loading("جاري الحذف...");
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.dismiss();
      toast.success("تم حذف الإعلان");
      navigate({ to: "/profile" });
    } catch (err: any) {
      toast.dismiss();
      toast.error("تعذّر حذف الإعلان: " + err.message);
    }
  }

  if (isLoading) return <div className="animate-fade-in bg-[#040712] min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary size-10" /></div>;

  if (!data) return (
    <div className="p-20 text-center bg-[#040712] min-h-screen flex flex-col items-center justify-center">
      <Package className="size-10 text-slate-700 mb-4" />
      <h2 className="text-xl font-black text-white">إعلان غير متوفر</h2>
      <button onClick={() => navigate({ to: "/" })} className="press mt-4 text-primary text-xs font-bold uppercase">العودة للرئيسية</button>
    </div>
  );

  const seller = (data as any).profiles;
  const images: string[] = data.images ?? [];
  const displayDescription = data.description
    ?.replace(/السعر:.*\n?/, "")
    .replace(/الكمية المتوفرة:.*\n?/, "");

  return (
    <div className="animate-fade-in pb-32 bg-[#040712] min-h-screen rtl text-right" dir="rtl">
      <div className="relative">
        <div className="aspect-square w-full relative overflow-hidden">
          <StorageImage path={images[active] ?? null} alt={data.title} className="size-full object-cover" eager />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040712] via-transparent to-transparent opacity-80" />
        </div>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6 z-50">
          <button onClick={() => window.history.back()} className="press flex size-12 items-center justify-center rounded-2xl bg-[#0f172a]/60 backdrop-blur-md border border-white/10 shadow-2xl">
            <ArrowRight className="size-5 text-white" />
          </button>
          <div className="flex gap-3">
            <button onClick={() => { const r = prompt("سبب الإبلاغ؟"); if (r) reportProduct.mutate(r); }} className="press flex size-12 items-center justify-center rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400">
               <ShieldAlert className="size-5" />
            </button>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0f172a]/60 backdrop-blur-md border border-white/10">
              <FavoriteButton productId={id} />
            </div>
          </div>
        </div>

        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2 z-10">
            {images.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-10 bg-primary shadow-glow" : "w-2 bg-white/20")} />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-12 relative z-20 space-y-6">
        {images.length > 1 && (
          <div className="no-scrollbar flex gap-3 overflow-x-auto p-4 bg-[#0f172a]/60 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl">
            {images.map((p, i) => (
              <button key={p} onClick={() => setActive(i)} className="press shrink-0">
                <div className={cn("size-16 rounded-2xl overflow-hidden border-2", i === active ? "border-primary" : "border-white/5 opacity-50")}>
                  <StorageImage path={p} alt="" className="size-full object-cover" />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="bg-[#0f172a] border border-white/5 rounded-[3rem] p-8 shadow-2xl space-y-6">
          <div className="flex items-start justify-between gap-6">
            <h1 className="text-2xl font-black text-white leading-tight">{data.title}</h1>
            <span className={cn("shrink-0 rounded-full px-4 py-1.5 text-[10px] font-black border", data.condition === "new" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20")}>
              {CONDITION_LABEL[data.condition] || data.condition}
            </span>
          </div>

          <p className="text-4xl font-black text-primary tracking-tighter drop-shadow-glow">
            {formatPrice(Number(data.price), data.currency)}
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
            <Chip icon={<CategoryIcon slug={data.category} className="size-3" />}>{categoryName(data.category)}</Chip>
            {data.brand && <Chip icon={<Package className="size-3" />}>{data.brand}</Chip>}
            <Chip icon={<MapPin className="size-3" />}>{data.city} {data.area ? ` — ${data.area}` : ""}</Chip>
            <Chip icon={<Eye className="size-3 text-emerald-400" />}>{data.views_count} مشاهدة</Chip>
            <Chip icon={<CirclePlus className="size-3 text-gold" />}>الكمية المتاحة: {data.availableStock}</Chip>
            <Chip icon={<Clock className="size-3" />}>{timeAgo(data.created_at)}</Chip>
          </div>
        </div>

        {/* RESTORED DESCRIPTION */}
        {displayDescription && (
          <div className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-6 px-1 flex items-center gap-3">
              <div className="size-1 bg-primary rounded-full animate-pulse" />
              التفاصيل التقنية
            </h2>
            <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
              <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line font-medium italic">
                {displayDescription}
              </p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black uppercase text-white">ملف البائع</h2>
            <Link to={data.store_id ? "/store/$id" : "/seller/$id"} params={{ id: data.store_id || seller?.id || "" }} className="text-[10px] font-black text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
              {data.store_id ? "زيارة المتجر" : "معاينة الهوية"}
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="size-20 rounded-[1.75rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-glow border-4 border-[#0f172a] overflow-hidden">
              {seller?.avatar_url ? <img src={supabase.storage.from("profile-images").getPublicUrl(seller.avatar_url).data.publicUrl} className="size-full object-cover" alt="" /> : (seller?.full_name || "؟").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-black text-white truncate">{seller?.shop_name || seller?.full_name || "تاجر"}</p>
              <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase mt-2">
                <MapPin className="size-3 text-primary/60" /> {seller?.city}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-6 z-50">
          {isOwner ? (
             <div className="flex flex-col gap-3 bg-[#0f172a]/80 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/10 shadow-3xl">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowManageResModal(true)}
                    disabled={data.availableStock === 0 && data.status === 'sold'}
                    className="press flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
                  >
                     <CheckCircle2 className="size-4" /> إدارة الطلبات والتفاوض (المتاح: {data.availableStock})
                  </button>
                  <button onClick={removeListing} className="press flex-1 bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2">
                     <Trash2 className="size-4" /> حذف
                  </button>
                </div>
                <Link to="/product/$id/edit" params={{id}} className="press w-full bg-white/5 text-white border border-white/10 py-4 rounded-2xl font-black text-xs uppercase text-center flex items-center justify-center gap-2">
                   <Edit className="size-4" /> تعديل الإعلان
                </Link>
             </div>
          ) : (
            <div className="flex flex-col gap-3 bg-[#0f172a]/80 backdrop-blur-xl p-4 rounded-[3rem] border border-white/10 shadow-3xl">
              {/* DISPLAY EXISTING RESERVATION BANNER IF PRESENT */}
              {data.myRes && (
                <div className="bg-emerald-600/90 backdrop-blur-xl p-4 rounded-[2rem] border border-white/20 shadow-xl text-center mb-1 animate-fade-in">
                   <div className="flex items-center justify-center gap-2 mb-1">
                     <CheckCircle2 className="size-5 text-white" />
                     <p className="text-xs font-black text-white uppercase italic">
                       لديك طلب حجز سابق لـ {data.myRes.requested_quantity || data.myRes.quantity || 1} قطعة
                     </p>
                   </div>
                   {data.myRes.buyer_note && (
                      <p className="text-[10px] text-white/90 italic truncate">"{data.myRes.buyer_note}"</p>
                   )}
                   <div className="mt-2 text-[10px] text-white/80 font-mono">
                     ينتهي خلال: {myTimeLeft || '--:--:--'}
                   </div>
                </div>
              )}

              {data.availableStock > 0 ? (
                <>
                  {/* MULTI-RESERVATION BUTTON: DYNAMICALLY SWITCHES TEXT TO "حجز المزيد" */}
                  <button
                    onClick={() => setShowResModal(true)}
                    className="press gradient-primary shadow-glow flex w-full items-center justify-center gap-3 rounded-[2rem] py-5 text-lg font-black text-white uppercase tracking-[0.15em]"
                  >
                    {data.myRes ? <Plus className="size-6" /> : <ShoppingBag className="size-6" />}
                    {data.myRes ? "حجز المزيد" : "طلب الحجز والتفاوض"}
                  </button>
                  <div className="flex gap-3">
                    <a href={`tel:${data.phone}`} className="press flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-black text-white uppercase"><Phone className="size-4" /> اتصال</a>
                    <button onClick={handleStartChat} disabled={startConversation.isPending} className="press flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-black text-white uppercase">
                      {startConversation.isPending ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />} دردشة
                    </button>
                  </div>
                </>
              ) : data.status === "sold" ? (
                <div className="bg-emerald-600 p-6 rounded-[2.5rem] text-center shadow-3xl">
                  <CheckCircle2 className="size-8 text-white mx-auto mb-2" />
                  <p className="text-lg font-black text-white">تم البيع بنجاح (مباع بالكامل)</p>
                </div>
              ) : (
                <div className="bg-amber-500 border-2 border-white/20 p-6 rounded-[2.5rem] text-center shadow-3xl">
                  <div className="flex items-center justify-center gap-3 mb-2"><Clock className="size-5 text-white animate-pulse" /><p className="text-lg font-black text-white uppercase italic">نفذت الكمية (محجوز بالكامل)</p></div>
                  <div className="bg-black/20 py-2 px-4 rounded-xl inline-block border border-white/10"><p className="text-xs font-bold text-white">أقرب كمية ستتوفر خلال: <span className="font-mono text-sm">{timeLeft || '--h --m --s'}</span></p></div>
                  <p className="text-[9px] text-white/70 mt-3 font-bold">كل القطع محجوزة حالياً. ستتوفر القطع تلقائياً فور انتهاء وقت الحجز لأي زبون.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BUYER RESERVATION & NEGOTIATION DIALOG (QUANTITY + NOTE) */}
      <Dialog open={showResModal} onOpenChange={setShowResModal}>
        <DialogContent className="rounded-t-[3rem] sm:rounded-[3rem] bg-[#0f172a] border-t border-white/10 p-8 bottom-0 top-auto translate-y-0 translate-x-[-50%] max-w-md shadow-3xl outline-none no-scrollbar">
           <DialogHeader className="text-center mb-6">
              <DialogTitle className="text-2xl font-black italic tracking-tighter text-white uppercase">
                {data?.myRes ? "حجز المزيد من القطع" : "طلب الحجز والتفاوض"}
              </DialogTitle>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                حدد الكمية واكتب رسالتك للبائع وسيقوم بمراجعة طلبك
              </p>
           </DialogHeader>

           <div className="space-y-6">
              {/* QUANTITY INPUT WITH NUMBER TYPE EDITTEXT + SELECTOR */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                   <span>الكمية المطلوبة</span>
                   <span className="text-primary font-bold">*</span>
                 </label>
                 <div className="flex items-center justify-between gap-4 bg-white/5 p-3 rounded-2xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setResQty(q => Math.max(1, q - 1))}
                      className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-white press shrink-0"
                    > - </button>

                    <div className="flex-1 flex flex-col items-center">
                       <input
                         type="number"
                         min={1}
                         max={data?.availableStock || 1}
                         value={resQty}
                         onChange={(e) => {
                           const val = parseInt(e.target.value);
                           if (!isNaN(val)) {
                             setResQty(Math.max(1, Math.min(data?.availableStock || 1, val)));
                           }
                         }}
                         className="w-20 h-12 bg-black/40 border border-white/10 rounded-xl text-center text-2xl font-black text-primary font-mono outline-none focus:border-primary"
                       />
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">المتاح حالياً: {data?.availableStock}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setResQty(q => Math.min(data?.availableStock || 1, q + 1))}
                      className="size-12 rounded-xl bg-primary flex items-center justify-center text-2xl font-black text-white shadow-glow press shrink-0"
                    > + </button>
                 </div>
              </div>

              {/* NEGOTIATION NOTE TEXTAREA (REQUIRED) */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                   <span>رسالة التفاوض / الملاحظة (إلزامي)</span>
                   <span className="text-primary font-bold">*</span>
                 </label>
                 <textarea
                   value={buyerNote}
                   onChange={(e) => setBuyerNote(e.target.value)}
                   rows={3}
                   placeholder="مثال: هل يمكنك الشحن إلى حلب؟ / أقدم عرض سعر 120$ للقطعة..."
                   className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-medium text-white outline-none focus:border-primary transition-all resize-none"
                 />
              </div>

              <button
                onClick={() => reserveProduct.mutate()}
                disabled={reserveProduct.isPending || !buyerNote.trim() || !resQty}
                className="press w-full h-16 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-glow flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {reserveProduct.isPending ? <Loader2 className="size-5 animate-spin" /> : <><CheckCircle2 className="size-5" /> {data?.myRes ? "تأكيد طلب حجز آخر" : "إرسال طلب الحجز والتفاوض"}</>}
              </button>
           </div>
        </DialogContent>
      </Dialog>

      {/* SELLER MANAGEMENT DIALOG WITH LIVE INVENTORY SYNC */}
      <Dialog open={showManageResModal} onOpenChange={setShowManageResModal}>
        <DialogContent className="rounded-t-[3rem] sm:rounded-[3rem] bg-[#0f172a] border-t border-white/10 p-8 bottom-0 top-auto translate-y-0 translate-x-[-50%] max-w-md shadow-3xl outline-none no-scrollbar">
           <DialogHeader className="text-center mb-4">
              <DialogTitle className="text-2xl font-black italic tracking-tighter text-white uppercase">طلبات التفاوض والحجز</DialogTitle>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">راجع رسائل المشترين والكميات المطلوبة للقبول أو الرفض</p>
           </DialogHeader>

           {/* REAL-TIME INVENTORY HEADER */}
           <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between mb-4 shadow-sm">
             <div className="flex items-center gap-2">
               <Package className="size-4 text-primary" />
               <span className="text-xs font-black text-white">المخزون المتاح حالياً:</span>
             </div>
             <span className="text-base font-black text-primary font-mono tracking-widest">{data?.availableStock || 0} قطعة</span>
           </div>

           <div className="space-y-4 max-h-[55vh] overflow-y-auto no-scrollbar pb-6">
              {loadingPending ? (
                <div className="p-10 text-center"><Loader2 className="size-8 animate-spin text-primary mx-auto" /></div>
              ) : pendingReservations && pendingReservations.length > 0 ? (
                pendingReservations.map((res: any) => {
                  const reqQty = res.requested_quantity || res.quantity || 1;
                  const currentAvailable = data?.availableStock || 0;
                  const isExceeding = reqQty > currentAvailable;

                  return (
                    <div key={res.id} className={cn("border rounded-3xl p-5 space-y-4 transition-all", isExceeding ? "bg-red-500/5 border-red-500/20 opacity-60" : "bg-white/5 border-white/10")}>
                       <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                             <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
                                {res.profiles?.avatar_url ? (
                                   <img
                                     src={supabase.storage.from("profile-images").getPublicUrl(res.profiles.avatar_url).data.publicUrl}
                                     className="size-full object-cover"
                                   />
                                ) : (
                                   <User className="size-6 text-primary" />
                                )}
                             </div>
                             <div className="min-w-0">
                                <p className="text-sm font-black text-white truncate">{res.profiles?.full_name || "مشتري"}</p>
                                <p className="text-[10px] text-primary font-bold">
                                  طلب: <span className="font-mono font-black text-white">{reqQty}</span> قطعة • {timeAgo(res.created_at)}
                                </p>
                             </div>
                          </div>
                          {res.profiles?.phone && (
                            <a
                              href={`tel:${res.profiles.phone}`}
                              className="press size-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0"
                            >
                              <Phone className="size-4" />
                            </a>
                          )}
                       </div>

                       {/* BUYER NOTE BUBBLE */}
                       {res.buyer_note ? (
                          <div className="bg-black/40 border border-primary/20 rounded-2xl p-3.5 text-right">
                             <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
                               <MessageSquare className="size-3" /> رسالة المشتري والتفاوض:
                             </p>
                             <p className="text-xs text-slate-200 font-bold leading-relaxed">{res.buyer_note}</p>
                          </div>
                       ) : (
                          <div className="bg-white/5 rounded-2xl p-3 text-center">
                             <p className="text-[10px] text-slate-500 font-bold">لا توجد ملاحظة مرفقة</p>
                          </div>
                       )}

                       {/* INVENTORY EXCEEDING WARNING */}
                       {isExceeding && (
                          <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl flex items-center gap-2 text-red-400 text-[10px] font-bold">
                            <AlertCircle className="size-3.5 shrink-0" />
                            <span>الكمية المطلوبة ({reqQty}) تتجاوز المخزون المتاح ({currentAvailable}). غير متاح للقبول حالياً.</span>
                          </div>
                       )}

                       {/* ACTION BUTTONS: APPROVE / REJECT */}
                       <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من الموافقة على حجز ${reqQty} قطع لـ ${res.profiles?.full_name}؟ سيتغير المخزون وتتحدث بافي الطلبات تلقائياً.`)) {
                                approveReservation.mutate(res);
                              }
                            }}
                            disabled={approveReservation.isPending || isExceeding}
                            className="press flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black text-xs uppercase shadow-glow flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {approveReservation.isPending ? <Loader2 className="size-4 animate-spin" /> : <><CheckCircle2 className="size-4" /> قبول وحجز</>}
                          </button>
                          <button
                            onClick={() => {
                              setRejectingRes(res);
                              setShowRejectModal(true);
                            }}
                            disabled={rejectReservation.isPending}
                            className="press flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2"
                          >
                             <XCircle className="size-4" /> رفض الطلب
                          </button>
                       </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center space-y-4 opacity-30">
                   <ShoppingBag className="size-12 mx-auto text-slate-500" />
                   <p className="text-xs font-black uppercase tracking-widest">لا توجد طلبات حجز معلقة حالياً</p>
                </div>
              )}
           </div>
        </DialogContent>
      </Dialog>

      {/* SELLER REJECTION REASON DIALOG */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="rounded-t-[3rem] sm:rounded-[3rem] bg-[#0f172a] border-t border-white/10 p-8 bottom-0 top-auto translate-y-0 translate-x-[-50%] max-w-md shadow-3xl outline-none">
           <DialogHeader className="text-center mb-6">
              <DialogTitle className="text-2xl font-black italic tracking-tighter text-red-400 uppercase">رفض طلب الحجز</DialogTitle>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                سبب الرفض لـ {rejectingRes?.profiles?.full_name || 'المشتري'} (إلزامي)
              </p>
           </DialogHeader>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">سبب الرفض</label>
                 <textarea
                   value={rejectionReason}
                   onChange={(e) => setRejectionReason(e.target.value)}
                   rows={3}
                   placeholder="مثال: القطعة تم حجزها خارج التطبيق / الكمية غير كافية..."
                   className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-medium text-white outline-none focus:border-red-500 transition-all resize-none"
                 />
              </div>

              <div className="flex gap-3">
                 <button
                   onClick={() => setShowRejectModal(false)}
                   className="press flex-1 bg-white/5 border border-white/10 text-slate-300 py-4 rounded-xl font-black text-xs uppercase"
                 >
                   إلغاء
                 </button>
                 <button
                   onClick={() => rejectReservation.mutate()}
                   disabled={rejectReservation.isPending || !rejectionReason.trim()}
                   className="press flex-[2] bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-black text-xs uppercase shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   {rejectReservation.isPending ? <Loader2 className="size-4 animate-spin" /> : <><XCircle className="size-4" /> تأكيد الرفض والإرسال</>}
                 </button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Chip({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-4 py-2 text-[10px] font-black text-slate-300 uppercase tracking-tighter shadow-sm hover:bg-white/10 hover:border-white/10 transition-all">
      {icon && <span className="text-primary/60">{icon}</span>}
      {children}
    </span>
  );
}
