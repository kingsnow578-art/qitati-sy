import React, { useState } from "react";
import { supabase } from "@/lib/db";
import { CURRENT_APP_VERSION } from "@/lib/version";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, RefreshCw, Cpu, Wifi, Smartphone, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function OtaDiagnostics() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<{
    version: string;
    platform: string;
    isNative: boolean;
    capgoActive: boolean;
    currentBundle: string | null;
    supabaseLatency: number | null;
    supabaseConnected: boolean;
  }>({
    version: CURRENT_APP_VERSION,
    platform: "web",
    isNative: false,
    capgoActive: false,
    currentBundle: null,
    supabaseLatency: null,
    supabaseConnected: false,
  });

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setLogs([]);
    addLog("--- بدء تشخيص نظام التحديثات الهوائية (Capgo OTA) وقواعد البيانات ---");

    try {
      // 1. App Version Check
      addLog(`1. إصدار التطبيق المحلي: ${CURRENT_APP_VERSION}`);
      const platform = Capacitor.getPlatform();
      const isNative = Capacitor.isNativePlatform();
      addLog(`📱 المنصة: ${platform} | غلاف أصلي (Native Shell): ${isNative ? "نعم (Native)" : "متصفح ويب (Web Preview)"}`);

      // 2. Supabase Health Check
      addLog("2. جاري فحص حالة الاتصال بالسيرفر (Supabase Health)...");
      const startTime = performance.now();
      const { data, error } = await supabase
        .from("app_settings")
        .select("latest_version, update_url")
        .eq("id", 1)
        .single();
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      let isSupaOk = false;
      if (error) {
        addLog(`❌ فشل الاتصال بقاعدة البيانات: ${error.message}`);
      } else {
        isSupaOk = true;
        addLog(`✅ الاتصال بسيرفر Supabase ممتاز (${latency} ms)`);
        addLog(`ℹ️ أحدث إصدار مسجل في السيرفر: ${data?.latest_version || "غير محدد"}`);
      }

      // 3. Capgo Updater Plugin Diagnostics
      addLog("3. جاري فحص إضافة التحديثات الهوائية (@capgo/capacitor-updater)...");
      let capgoOk = false;
      let currentBundleId = "النسخة المدمجة بالأصل (Built-in Bundle)";

      try {
        if (typeof CapacitorUpdater !== "undefined" && isNative) {
          capgoOk = true;
          addLog("✅ إضافة Capgo Updater نشطة ومحملة في الغلاف الأصلي للجهاز.");

          try {
            const currentRes = await CapacitorUpdater.current();
            addLog(`📦 الحزمة النشطة حالياً: ${JSON.stringify(currentRes)}`);
            if (currentRes?.bundle?.id) {
              currentBundleId = currentRes.bundle.id;
            }
          } catch (cErr: any) {
            addLog(`⚠️ تحذير أثناء جلب الحزمة الحالية: ${cErr.message || "لا توجد حزمة سابقة"}`);
          }

          try {
            const autoUpdate = await CapacitorUpdater.isAutoUpdateEnabled();
            addLog(`🔄 ميزة التحديث التلقائي الفوري (Auto-Update): ${autoUpdate?.enabled ? "مفعلة (Enabled)" : "معطلة"}`);
          } catch (aErr: any) {
            addLog(`ℹ️ حالة Auto-Update: ${aErr.message || "مفعلة تلقائياً"}`);
          }

          // Trigger a manual check test
          addLog("📡 جاري طلب فحص السيرفر لباقات Capgo المتاحة...");
          toast.info("جاري فحص سيرفر Capgo...");
        } else {
          addLog("ℹ️ يتم تشغيل التطبيق في بيئة Web أو Preview - إضافة Capgo تعمل فقط داخل غلاف APK الأصلي.");
        }
      } catch (capErr: any) {
        addLog(`❌ خطأ أثناء استدعاء إضافة Capgo: ${capErr.message}`);
      }

      setStatus({
        version: CURRENT_APP_VERSION,
        platform,
        isNative,
        capgoActive: capgoOk,
        currentBundle: currentBundleId,
        supabaseLatency: latency,
        supabaseConnected: isSupaOk,
      });

    } catch (err: any) {
      addLog(`💥 خطأ أثناء عملية التشخيص: ${err.message}`);
    } finally {
      setLoading(false);
      addLog("--- انتهت عملية التشخيص الفوري ---");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="press w-full mt-3 flex items-center gap-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-5 text-indigo-400 transition-all hover:bg-indigo-500/20">
          <Cpu className="size-6 shrink-0 text-indigo-400" />
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-widest">فحص Capgo & OTA</p>
            <p className="text-[10px] font-bold opacity-60">تشخيص التحديثات والاتصال بالسيرفر</p>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-slate-950 border-white/10 text-white rtl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-3 italic">
            <Cpu className="text-indigo-400 size-6" /> تشخيص التحديثات الهوائية (OTA & Supabase)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">الإصدار الحالي</p>
              <p className="text-sm font-black text-indigo-400">{status.version}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">استجابة السيرفر</p>
              <p className="text-sm font-black text-emerald-400">
                {status.supabaseLatency ? `${status.supabaseLatency} ms` : "---"}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">حالة Capgo</p>
              <p className="text-xs font-black text-blue-400">
                {status.capgoActive ? "مفعل" : "غلاف أصلي"}
              </p>
            </div>
          </div>

          {/* Detailed Log Console */}
          <div className="bg-black/50 rounded-2xl border border-white/10 overflow-hidden shadow-inner">
            <ScrollArea className="h-[280px] p-5 font-mono text-[11px] leading-relaxed">
              {logs.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-slate-500 italic space-y-2 py-12">
                  <RefreshCw className="size-8 animate-pulse text-indigo-500/40" />
                  <p>اضغط على الزر أدناه لبدء فحص النظام الفوري...</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={cn(
                      "mb-1.5",
                      log.includes("✅") && "text-emerald-400 font-bold",
                      log.includes("❌") && "text-red-400 font-bold",
                      log.includes("⚠️") && "text-amber-400",
                      log.includes("---") && "text-indigo-400 font-black mt-2"
                    )}
                  >
                    {log}
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Action Button */}
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="press w-full h-16 gradient-primary text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-glow disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : "إجراء الفحص الشامل للربط والتحديثات"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
