import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type AdminRole =
  "super_admin" | "product_manager" | "support_manager" | "advertisement_manager";

export type AdminProfile = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  role: AdminRole;
  permissions: string[];
  created_at: string;
};

export function useAdmin() {
  const { user } = useAuth();

  const {
    data: admin,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin_profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Check if admin
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching admin profile:", error);
        return null;
      }

      return data as AdminProfile | null;
    },
    staleTime: 1000 * 60 * 5,
  });

  const hasPermission = (permission: string) => {
    if (!admin) return false;
    if (admin.role === "super_admin" || admin.permissions.includes("all")) return true;
    return admin.permissions.includes(permission);
  };

  return {
    admin,
    isAdmin: !!admin,
    isLoading,
    hasPermission,
  };
}
