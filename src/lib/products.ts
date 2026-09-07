import { supabase } from "@/lib/db";
import type { ProductCardData } from "@/components/ProductCard";

const LIST_COLUMNS =
  "id, title, price, currency, city, condition, category, images, is_featured, created_at, status, quantity";

export type ProductFilters = {
  q?: string;
  category?: string;
  city?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function fetchProducts(
  filters: ProductFilters = {},
  limit = 30,
): Promise<ProductCardData[]> {
  let query = supabase
    .from("products")
    .select(LIST_COLUMNS)
    .in("status", ["published", "reserved"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.q) query = query.or(`title.ilike.%${filters.q}%,brand.ilike.%${filters.q}%`);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.condition) query = query.eq("condition", filters.condition as "new" | "used");
  if (typeof filters.minPrice === "number") query = query.gte("price", filters.minPrice);
  if (typeof filters.maxPrice === "number") query = query.lte("price", filters.maxPrice);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ProductCardData[];
}

export async function fetchFeatured(limit = 10): Promise<ProductCardData[]> {
  const { data, error } = await supabase
    .from("products")
    .select(LIST_COLUMNS)
    .in("status", ["published", "reserved"])
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ProductCardData[];
}

export async function fetchPromoted(limit = 10): Promise<ProductCardData[]> {
  const { data, error } = await supabase
    .from("products")
    .select(LIST_COLUMNS)
    .in("status", ["published", "reserved"])
    .eq("promotion_status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ProductCardData[];
}

export async function fetchSponsored(limit = 5) {
  const { data, error } = await supabase
    .from("sponsored_ads")
    .select(
      `
      *,
      products (${LIST_COLUMNS})
    `,
    )
    .eq("is_active", true)
    .eq("status", "approved")
    .gt("end_date", new Date().toISOString())
    .order("priority", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data?.map((ad) => ad.products).filter(Boolean) as ProductCardData[];
}

export async function fetchAnnouncements() {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`)
    .order("priority", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      profiles:seller_id (
        id, full_name, phone, city, avatar_url, is_shop, shop_name, is_verified, description, average_rating, review_count
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("fetchProduct Error:", error);
    throw error;
  }

  if (!data) return null;

  // Fetch ratings for the seller separately to avoid join issues
  const { data: ratings } = await supabase
    .from("ratings")
    .select("stars")
    .eq("seller_id", data.seller_id);

  const ratingAvg =
    ratings && ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.stars, 0) / ratings.length
      : 0;

  return { ...data, ratingAvg, ratingCount: ratings?.length || 0 };
}
