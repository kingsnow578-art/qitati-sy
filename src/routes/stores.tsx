import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/db";
import {
  Store,
  Search,
  Loader2,
  Sparkles,
  MapPin,
  ChevronLeft,
} from "lucide-react";

export const Route = createFileRoute("/stores")({
  component: StoresGalleryPage,
});

function StoresGalleryPage() {
  const [search, setSearch] = useState("");

  const { data: stores, isLoading } = useQuery({
    queryKey: ["public_stores", search],
    queryFn: async () => {
      let query = supabase
        .from("stores")
        .select(`*, profiles:owner_id (avatar_url, full_name)`)
        .eq("status", "active");

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="animate-fade-in bg-background min-h-screen pb-20 rtl text-right" dir="rtl">
      <header className="gradient-hero rounded-b-[3.5rem] px-6 pt-12 pb-20 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-[0.03] mix-blend-overlay" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="size-20 rounded-[2rem] bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md shadow-glow">
            <Store className="size-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter">
              المتاجر الموثقة
            </h1>
            <p className="text-xs text-primary font-black uppercase tracking-[0.3em] mt-2 opacity-80">
              Official Hardware Partners
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 -mt-10 relative z-20 space-y-8">
        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
            <Search className="size-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن متجر معين..."
            className="w-full bg-card/80 backdrop-blur-xl border border-border rounded-2xl py-4 pr-12 pl-6 text-sm font-bold outline-none focus:border-primary/50 transition-all shadow-premium"
          />
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="size-10 animate-spin mx-auto text-primary opacity-20" />
          </div>
        ) : stores && stores.length > 0 ? (
          <div className="grid gap-5">
            {stores.map((s: any, i) => (
              <Link
                key={s.id}
                to="/store/$id"
                params={{ id: s.id }}
                style={{ animationDelay: `${i * 50}ms` }}
                className="press block bg-card border border-border rounded-[2.5rem] p-6 shadow-card hover:border-primary/20 transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors" />

                <div className="flex items-center gap-6">
                  <div className="size-16 rounded-[1.5rem] bg-slate-800 overflow-hidden border border-white/5 shrink-0 transition-transform group-hover:rotate-3 flex items-center justify-center shadow-xl">
                    {s.logo_url ? (
                      <img
                        src={supabase.storage.from("stores").getPublicUrl(s.logo_url).data.publicUrl}
                        className="size-full object-cover"
                        alt=""
                      />
                    ) : s.profiles?.avatar_url ? (
                      <img
                        src={supabase.storage.from("profile-images").getPublicUrl(s.profiles.avatar_url).data.publicUrl}
                        className="size-full object-cover"
                        alt=""
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-2xl font-black text-slate-600">
                        {s.name?.charAt(0) || "S"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black truncate text-foreground">{s.name}</h3>
                      <Sparkles className="size-3.5 text-amber-500 fill-amber-500 shadow-glow" />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3 text-primary" /> {s.region}
                      </span>
                    </div>
                  </div>
                  <div className="size-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                    <ChevronLeft className="size-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center space-y-4 opacity-30">
            <Store className="size-16 mx-auto text-slate-500" />
            <p className="text-sm font-black uppercase tracking-widest">لا توجد متاجر نشطة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
