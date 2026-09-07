import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh = memo(({ onRefresh, children, className }: PullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const PULL_THRESHOLD = 80;
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      const touch = e.touches[0];
      if (touch) {
        startY.current = touch.pageY;
        setIsPulling(true);
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling) return;
    const touch = e.touches[0];
    if (!touch) return;
    currentY.current = touch.pageY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      if (e.cancelable) e.preventDefault();
      const resistance = 0.4;
      setPullDistance(Math.min(diff * resistance, PULL_THRESHOLD + 40));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setIsPulling(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, isPulling, onRefresh]);

  return (
    <div ref={containerRef} className={cn("relative min-h-screen", className)}>
      {/* Indicator */}
      <div
        className={cn(
          "absolute left-0 right-0 z-50 flex justify-center transition-all duration-300 pointer-events-none",
          isPulling || isRefreshing ? "opacity-100" : "opacity-0",
        )}
        style={{
          top: `${pullDistance - 50}px`,
          transform: isRefreshing
            ? "translateY(0)"
            : `translateY(${Math.min(pullDistance / 2, 20)}px)`,
        }}
      >
        <div className="size-10 rounded-full bg-[#0f172a] border border-white/10 shadow-glow flex items-center justify-center">
          {isRefreshing ? (
            <Loader2 className="size-5 text-primary animate-spin" />
          ) : (
            <RefreshCw
              className="size-5 text-primary transition-transform duration-200"
              style={{ transform: `rotate(${pullDistance * 2}deg)` }}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-300 will-change-transform"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {children}
      </div>
    </div>
  );
});
