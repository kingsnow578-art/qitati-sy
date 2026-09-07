import { toast } from "sonner";

/**
 * Checks if the device is currently online.
 * If offline, shows a toast and returns false.
 */
export function ensureOnline(): boolean {
  if (!navigator.onLine) {
    toast.error("أنت غير متصل بالإنترنت حالياً", {
      description: "يرجى التحقق من اتصالك والمحاولة مرة أخرى."
    });
    return false;
  }
  return true;
}

/**
 * Maps system and Supabase error messages to friendly Arabic text.
 */
export function getArabicErrorMessage(error: any): string {
  if (!error) return "حدث خطأ غير متوقع";
  const msg = typeof error === "string" ? error : error.message || "";

  if (msg.includes("offline") || !navigator.onLine) {
    return "أنت غير متصل بالإنترنت حالياً. يرجى التحقق من الاتصال وإعادة المحاولة.";
  }
  if (msg.includes("JWT expired") || msg.includes("invalid claim") || msg.includes("session")) {
    return "انتهت الجلسة. يرجى إعادة تسجيل الدخول.";
  }
  if (msg.includes("row-level security") || msg.includes("RLS") || msg.includes("permission denied")) {
    return "ليس لديك الصلاحيات الكافية لإجراء هذه العملية.";
  }
  if (msg.includes("duplicate key") || msg.includes("unique constraint")) {
    return "هذا السجل موجود بالفعل في النظام.";
  }
  return msg || "تعذّر إكمال العملية، يرجى المحاولة لاحقاً.";
}
