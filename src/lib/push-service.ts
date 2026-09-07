import { supabase } from "@/lib/db";
import { toast } from "sonner";

export const PushService = {
  /**
   * Sends a push notification to a specific user or multiple users via Supabase Edge Function (FCM relay).
   */
  async sendPushNotification(targetUserId: string | string[], title: string, body: string, data: any = {}) {
    try {
      const userIds = Array.isArray(targetUserId) ? targetUserId : [targetUserId];

      console.log(`[PushService] Triggering Edge Function for ${userIds.length} users...`);

      // We call the Edge Function for each user
      // Alternatively, we could refactor the Edge Function to accept an array of user IDs
      const results = await Promise.all(userIds.map(async (uid) => {
        try {
          const { data: result, error } = await supabase.functions.invoke("send-push-notification", {
            body: { user_id: uid, title, body, data },
          });

          if (error) throw error;
          return result;
        } catch (err: any) {
          console.error(`[PushService] Failed for user ${uid}:`, err);
          return { error: err.message };
        }
      }));

      console.log("[PushService] Batch results:", results);
      return results;
    } catch (error: any) {
      console.error("[PushService] Fatal Error:", error);
      toast.error(`Push Error: ${error.message}`);
    }
  },

  /**
   * Broadcasts to ALL users by fetching their IDs first.
   */
  async broadcastToAll(title: string, body: string, data: any = {}) {
    try {
      // 1. Get all unique user IDs that have tokens
      const { data: users, error } = await supabase
        .from("user_fcm_tokens" as any)
        .select("user_id");

      if (error || !users) return;

      const uniqueUserIds = [...new Set(users.map((u: any) => u.user_id))];

      console.log(`[PushService] Broadcasting to ${uniqueUserIds.length} unique users...`);

      // Call the push service for each
      await this.sendPushNotification(uniqueUserIds, title, body, data);
    } catch (e: any) {
      console.error("[PushService] Broadcast failed:", e);
      toast.error(`Broadcast Error: ${e.message}`);
    }
  }
};
