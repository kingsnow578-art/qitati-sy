import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tag, ClipboardList, ChevronLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useLanguage } from "@/context/LanguageContext";

import { cn } from "@/lib/utils";

interface AddActionMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddActionMenu({ open, onOpenChange }: AddActionMenuProps) {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const handleAction = (to: string) => {
    console.log("AddActionMenu: navigating to", to);
    onOpenChange(false);
    // Use a small timeout to ensure dialog closes before navigation
    setTimeout(() => {
      void navigate({ to: to as any });
    }, 10);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-t-[3rem] border-t border-white/10 bg-[#040712] p-8 pb-12 sm:rounded-[3rem] bottom-0 top-auto translate-y-0 translate-x-[-50%] max-w-md border-x-0 sm:border-x outline-none shadow-xl animate-slide-up">
        <DialogHeader className="mb-8">
          <div className="mx-auto w-12 h-1.5 bg-white/10 rounded-full mb-6" />
          <DialogTitle className="text-2xl font-black italic tracking-tighter text-white text-center">
            {t("what_to_add")}
          </DialogTitle>
        </DialogHeader>

        <div className={cn("grid gap-4", dir === "rtl" ? "rtl" : "ltr")} dir={dir}>
          <button
            onClick={() => handleAction("/sell")}
            className="press flex items-center gap-5 p-6 rounded-[2rem] bg-primary/10 border border-primary/20 group transition-all active:scale-[0.98]"
          >
            <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-glow shrink-0 group-hover:scale-105 transition-transform">
              <Tag className="size-7" />
            </div>
            <div className={cn("flex-1", dir === "rtl" ? "text-right" : "text-left")}>
              <h3 className="text-lg font-black text-primary italic">{t("add_product")}</h3>
              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-0.5">
                Add Product for Sale
              </p>
            </div>
            <ChevronLeft className={cn("size-5 text-primary/40", dir === "ltr" && "rotate-180")} />
          </button>

          <button
            onClick={() => handleAction("/requests/new")}
            className="press flex items-center gap-5 p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 group transition-all active:scale-[0.98]"
          >
            <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 shrink-0 group-hover:scale-105 transition-transform">
              <ClipboardList className="size-7" />
            </div>
            <div className={cn("flex-1", dir === "rtl" ? "text-right" : "text-left")}>
              <h3 className="text-lg font-black text-white italic">{t("add_request")}</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
                Add Purchase Request
              </p>
            </div>
            <ChevronLeft className={cn("size-5 text-white/20", dir === "ltr" && "rotate-180")} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
