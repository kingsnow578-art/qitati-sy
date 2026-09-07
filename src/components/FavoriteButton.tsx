import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function FavoriteButton({ productId }: { productId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorited } = useQuery({
    queryKey: ["favorite", productId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("product_id", productId)
        .eq("user_id", user!.id)
        .maybeSingle();
      return !!data;
    },
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("auth");
      if (favorited) {
        await supabase
          .from("favorites")
          .delete()
          .eq("product_id", productId)
          .eq("user_id", user.id);
      } else {
        await supabase.from("favorites").insert({ product_id: productId, user_id: user.id });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorite", productId] });
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => toast.error("يجب تسجيل الدخول لإضافة المفضلة"),
  });

  return (
    <button
      type="button"
      aria-label="إضافة إلى المفضلة"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.mutate();
      }}
      className="press flex size-8 items-center justify-center rounded-full border border-border bg-card/85 backdrop-blur"
    >
      <Heart
        className={cn(
          "size-4 transition-all",
          favorited ? "scale-110 fill-destructive text-destructive" : "text-muted-foreground",
        )}
      />
    </button>
  );
}
