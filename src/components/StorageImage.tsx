import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { getImageUrl, type ImageBucket } from "@/lib/images";
import { cn } from "@/lib/utils";

type Props = {
  path: string | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
  bucket?: ImageBucket | string;
  width?: number;
  quality?: number;
};

export function StorageImage({
  path,
  alt,
  className,
  eager = false,
  bucket = "product-images",
  width,
  quality = 80
}: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    setFailed(false);
    setUrl(null);
    if (!path) {
      setFailed(true);
      return;
    }

    // If it's already a full URL, use it directly
    if (path.startsWith("http")) {
      setUrl(path);
      return;
    }

    void getImageUrl(path, bucket as ImageBucket, { ...(width ? { width } : {}), ...(quality ? { quality } : {}) }).then((next) => {
      if (!active) return;
      if (next) setUrl(next);
      else setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [path, bucket, width, quality]);

  return (
    <div className={cn("relative overflow-hidden bg-muted will-change-transform", className)}>
      {!loaded && !failed && <div className="absolute inset-0 skeleton-shimmer" />}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <ImageOff className="size-7 opacity-20" />
        </div>
      )}
      {url && (
        <img
          src={url}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "size-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}
