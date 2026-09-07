import { useEffect, useRef } from "react";
import { PushNotifications, type Token as CapToken, type PushNotificationSchema, type ActionPerformed } from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hasRegistered = useRef(false);

  useEffect(() => {
    // Reset registration flag when user logs out
    if (!user) {
      hasRegistered.current = false;
      return;
    }

    if (hasRegistered.current) return;

    const initializePush = async () => {
      try {
        console.log("Initializing Push Notifications...");
        toast.info("بدء تهيئة نظام الإشعارات...", { duration: 2000 });

        let permStatus = await PushNotifications.checkPermissions();
        console.log("Current permission status:", permStatus);

        if (permStatus.receive === "prompt") {
          toast("يرجى الموافقة على صلاحيات الإشعارات...");
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== "granted") {
          console.warn("Push permissions denied by user");
          toast.error("صلاحيات الإشعارات مرفوضة من قبل المستخدم");
          return;
        }

        toast.success("تم منح صلاحية الإشعارات ✅", { duration: 2000 });

        // 1. Add Listeners BEFORE Registering
        await PushNotifications.removeAllListeners();

        // Register the 'registration' listener
        await PushNotifications.addListener("registration", async (token: CapToken) => {
          console.log("Push registration successful, token:", token.value);
          toast.success("تم توليد رمز الجهاز بنجاح! 🔑", {
            description: `Token: ${token.value.substring(0, 15)}...`
          });

          // TASK: Replace upsert with Select-then-Insert to avoid constraint errors
          try {
            const { data: existingToken, error: fetchError } = await supabase
              .from("user_fcm_tokens" as any)
              .select("token")
              .eq("token", token.value)
              .maybeSingle();

            if (fetchError) throw fetchError;

            if (!existingToken) {
              const { error: insertError } = await supabase.from("user_fcm_tokens" as any).insert({
                user_id: user.id,
                token: token.value,
              });
              if (insertError) throw insertError;

              console.log("Token successfully saved to Supabase (New).");
              toast.success("تم ربط الجهاز بحسابك بنجاح! 🎉");
            } else {
              console.log("Token already exists in database, skipping insert.");
              toast.success("تم التحقق من ربط الجهاز مسبقاً ✅");
            }
          } catch (error: any) {
            console.error("Supabase Operation Error:", error);
            toast.error(`خطأ في قاعدة البيانات: ${error.message}`);
          }
        });

        // Register the 'registrationError' listener
        await PushNotifications.addListener("registrationError", (error: any) => {
          console.error("Push registration error:", error);
          toast.error(`خطأ في تسجيل الإشعارات: ${error.error || "غير معروف"}`);
        });

        await PushNotifications.addListener("pushNotificationReceived", (notification: PushNotificationSchema) => {
          console.log("Push received (Foreground):", notification);

          // Since OS doesn't show banner in foreground, we show a toast
          toast.info(notification.title || "إشعار جديد", {
            description: notification.body,
            duration: 5000,
            action: notification.data?.url ? {
               label: "عرض",
               onClick: () => navigate({ to: notification.data.url })
            } : undefined
          });
        });

        await PushNotifications.addListener("pushNotificationActionPerformed", (action: ActionPerformed) => {
          console.log("Push action performed:", action);
          const data = action.notification.data;

          if (data?.url) {
            navigate({ to: data.url });
          } else if (data?.conversation_id) {
            navigate({ to: "/chat/$conversationId", params: { conversationId: data.conversation_id } });
          } else {
            navigate({ to: "/notifications" });
          }
        });

        await PushNotifications.register();
        hasRegistered.current = true;

      } catch (e) {
        console.error("Critical error in usePushNotifications:", e);
      }
    };

    initializePush();

    return () => {
      // Cleanup logic
    };
  }, [user, navigate]);
};
