import { supabase } from "@/lib/db";

export async function reportAppError(error: Error | any, context?: any) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id || null;

    await supabase.from("admin_error_reports").insert({
      user_id: userId,
      error_message: error.message || String(error),
      technical_error: error.stack || "No stack trace",
      page_route: window.location.pathname,
      human_explanation: context?.action || "Automatic system report",
      metadata: {
        ...context,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      status: "new",
    });
  } catch (err) {
    console.warn("Error reporting utility failed:", err);
  }
}
