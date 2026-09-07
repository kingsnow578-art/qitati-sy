import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  isLoading: boolean;
}

export function SplashScreen({ isLoading }: SplashScreenProps) {
  const [shouldRender, setShouldRender] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsFading(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500); // Fade duration
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
      setIsFading(false);
      return;
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#040712] transition-opacity duration-500 ease-in-out",
        isFading ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
      aria-hidden
    >
      {/* LOGO SECTION - Clean and optimized */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative size-40 sm:size-48 rounded-3xl bg-[#1e293b] flex items-center justify-center overflow-hidden border border-white/5 shadow-2xl">
          <img
            src={logo}
            alt="Qitati"
            className="size-24 sm:size-28 object-contain"
            loading="eager"
          />
        </div>

        <div className="mt-12 text-center">
          <h1 className="text-6xl sm:text-7xl font-black text-white leading-relaxed">قطعتي</h1>
          <div className="mt-4 space-y-1 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Marketplace</p>
            <p className="text-[8px] font-bold uppercase tracking-widest text-primary">
              Syria High-Tech Platform
            </p>
          </div>
        </div>
      </div>

      {/* PERFORMANCE-FRIENDLY LOADING */}
      <div className="absolute bottom-16 flex flex-col items-center gap-4">
        <div className="w-40 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-progress-load rounded-full" />
        </div>
      </div>
    </div>
  );
}
