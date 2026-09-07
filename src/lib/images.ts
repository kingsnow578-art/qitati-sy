import { supabase } from "@/lib/db";

export type ImageBucket =
  | "product-images"
  | "request-images"
  | "profile-images"
  | "stores"
  | "chat-images";

const CACHE_KEY = "qitati_image_cache_v2";
const URL_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

type CachedUrl = {
  url: string;
  expiresAt: number;
};

// Memory cache for active session
const memoryCache = new Map<string, string>();
// Coalesce multiple requests for the same path
const pendingRequests = new Map<string, Promise<string | null>>();

function getPersistentCache(): Record<string, CachedUrl> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

function setPersistentCache(path: string, bucket: string, url: string) {
  if (typeof window === "undefined") return;
  try {
    const cache = getPersistentCache();
    cache[`${bucket}:${path}`] = {
      url,
      expiresAt: Date.now() + URL_EXPIRY * 1000 - 60000, // 1 minute buffer
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Failed to update persistent image cache:", e);
  }
}

/**
 * Maps a table name or context to its Supabase Storage Bucket.
 */
export function getBucketForContext(context: string): ImageBucket {
  switch (context) {
    case "products": return "product-images";
    case "part_requests": return "request-images";
    case "profiles": return "profile-images";
    case "stores": return "stores";
    case "messages": return "chat-images";
    default: return "product-images";
  }
}

/**
 * Resolves a signed URL with optional CDN optimization/transformation.
 */
export async function getImageUrl(
  path: string,
  bucket: ImageBucket = "product-images",
  options: { width?: number; quality?: number } = {}
): Promise<string | null> {
  if (!path) return null;

  // External HTTP/HTTPS URLs (Google OAuth avatars, CDN links) pass through directly
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Include transformations in the cache key
  const transformKey = options.width ? `_w${options.width}_q${options.quality || 80}` : '';
  const cacheKey = `${bucket}:${path}${transformKey}`;

  // 1. Check memory cache
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey)!;

  // 2. Check persistent cache (localStorage)
  const pCache = getPersistentCache();
  if (pCache[cacheKey]) {
    const { url, expiresAt } = pCache[cacheKey];
    if (expiresAt > Date.now()) {
      memoryCache.set(cacheKey, url);
      return url;
    }
  }

  // 3. Coalesce pending requests
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey)!;

  const promise = (async () => {
    try {
      // Supabase supports image transformations in createSignedUrl for Pro plans.
      // We'll pass them in the options object.
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, URL_EXPIRY, {
        transform: options.width ? {
          width: options.width,
          quality: options.quality || 80,
          resize: 'cover',
        } : undefined
      });

      if (error) throw error;

      if (data?.signedUrl) {
        memoryCache.set(cacheKey, data.signedUrl);
        setPersistentCache(path, bucket + transformKey, data.signedUrl);
        return data.signedUrl;
      }
      return null;
    } catch (err) {
      console.error(`Error resolving image URL for ${bucket}/${path}:`, err);
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, promise);
  return promise;
}

export async function uploadProductImage(userId: string, file: File, bucket: ImageBucket = "product-images"): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}
