import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function PushDiagnostics() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Security check: Only Admin with this phone number
  const isAllowedAdmin = profile?.phone === "0935158237";

  if (!isAllowedAdmin) return null;

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setLogs([]);
    addLog("--- بدء عملية فحص نظام الإشعارات (Direct FCM/Edge) ---");

    try {
      // 1. Current Status
      addLog("1. جاري فحص حالة الجهاز الحالي...");
      addLog("ℹ️ ملاحظة: هذا الإصدار يستخدم Supabase Edge Functions لإرسال FCM مباشرة.");

      // 2. Fetch Database Token
      addLog("2. جاري البحث عن الرمز في قاعدة البيانات (Supabase)...");
      const { data: dbTokens, error: dbError } = await supabase
        .from("user_fcm_tokens" as any)
        .select("token")
        .eq("user_id", user?.id);

      if (dbError) {
        addLog(`❌ خطأ في قاعدة البيانات: ${dbError.message}`);
      } else if (!dbTokens || dbTokens.length === 0) {
        addLog("❌ لم يتم العثور على أي رموز لهذا المستخدم في الجدول.");
      } else {
        addLog(`✅ تم العثور على ${dbTokens.length} رموز في الجدول:`);
        dbTokens.forEach((t: any, i: number) => {
           addLog(`   [${i+1}] ${t.token}`);
        });
      }

      // 3. Test Push API (via Edge Function)
      if (dbTokens && dbTokens.length > 0) {
        addLog(`3. جاري إرسال إشعار تجريبي عبر Supabase Edge Function...`);

        try {
          const { data: result, error: invokeError } = await supabase.functions.invoke("send-push-notification", {
            body: {
              user_id: user?.id,
              title: "فحص نظام FCM",
              body: "هذا إشعار تجريبي للتأكد من وصول التنبيهات عبر Firebase.",
              data: { type: "diagnostic", timestamp: new Date().toISOString() }
            },
          });

          if (invokeError) {
            addLog(`❌ فشل استدعاء Edge Function: ${invokeError.message}`);
            toast.error("فشل استدعاء وظيفة الإرسال");
          } else {
            addLog(`📡 استجابة النظام:`);
            addLog(JSON.stringify(result, null, 2));

            if (result?.success) {
              addLog("🎉 تمت العملية بنجاح! تحقق من هاتفك خلال ثوانٍ.");
              toast.success("تم طلب إرسال الإشعار التجريبي");
            } else {
              addLog(`⚠️ تنبيه: الوظيفة لم ترجع حالة نجاح: ${result?.message || "غير معروف"}`);
            }
          }
        } catch (fetchErr: any) {
          addLog(`❌ خطأ في الاتصال بالسيرفر: ${fetchErr.message}`);
        }
      }

    } catch (globalErr: any) {
      addLog(`💥 خطأ غير متوقع: ${globalErr.message}`);
    } finally {
      setLoading(false);
      addLog("--- انتهى الفحص ---");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="press w-full mt-4 flex items-center gap-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5 text-amber-500 transition-all hover:bg-amber-500/20">
          <ShieldAlert className="size-6 shrink-0" />
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-widest">أداة التشخيص</p>
            <p className="text-[10px] font-bold opacity-60">فحص نظام FCM (للمطور فقط)</p>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-950 border-white/10 text-white rtl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-3">
             <ShieldAlert className="text-amber-500" /> فحص نظام FCM
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
            <ScrollArea className="h-[350px] p-6 font-mono text-[11px] leading-relaxed">
              {logs.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500 italic">
                  انقر على الزر أدناه لبدء الفحص...
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={cn(
                    "mb-1",
                    log.includes("✅") && "text-emerald-400",
                    log.includes("❌") && "text-red-400",
                    log.includes("⚠️") && "text-amber-400",
                    log.includes("---") && "text-blue-400 font-bold mt-2"
                  )}>
                    {log}
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="press w-full h-16 bg-blue-600 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : "بدء الفحص الآن"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
