import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  city: string;
  avatar_url: string | null;
  is_shop: boolean;
  shop_name: string | null;
  is_verified: boolean;
  description: string | null;
  average_rating: number;
  review_count: number;
  store_status: string;
};

type AuthValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile(userId: string) {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, city, avatar_url, is_shop, shop_name, is_verified, description, average_rating, review_count, store_status",
        )
        .eq("id", userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        console.log("Profile missing, creating default...");
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const phone = userData.user?.user_metadata?.["phone"] || "";
        const name = userData.user?.user_metadata?.["full_name"] || "مستخدم جديد";

        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            full_name: name,
            phone: phone,
            city: "دمشق",
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating profile:", createError);
          setError("تعذّر إنشاء الملف الشخصي");
          setProfile(null);
        } else {
          setProfile(newProfile as Profile);
        }
      } else {
        setProfile(data as Profile);
      }
    } catch (e: any) {
      console.error("Profile load error:", e);
      setError(e.message || "حدث خطأ أثناء تحميل الملف الشخصي");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        if (data.session?.user) {
          void loadProfile(data.session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Session load error:", err);
        setLoading(false);
      });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthValue = {
    user: session?.user ?? null,
    session,
    profile,
    loading,
    refreshProfile: async () => {
      if (session?.user) await loadProfile(session.user.id);
    },
    signOut: async () => {
      await supabase.auth.signOut();
      setProfile(null);
      setError(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
