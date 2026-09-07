import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, CirclePlus, MessageSquare, User, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddActionMenu } from "./AddActionMenu";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/db";

export function BottomNav() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const lastScrollY = useRef(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [visible, setVisible] = useState(true);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      const cached = localStorage.getItem("unread_messages_count");
      return cached ? parseInt(cached, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("unread_messages_count", unreadMessages.toString());
      } catch (e) {
        console.warn("Failed to set localStorage item:", e);
      }
    }
  }, [unreadMessages]);

  // Unread messages count logic
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      if (!error) setUnreadMessages(count || 0);
    };

    void fetchUnreadCount();

    // Subscribe to new messages and read status changes
    const channel = supabase
      .channel("nav-unread-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          void fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  // Detect keyboard using both viewport resize and focus events
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setIsKeyboardVisible(window.visualViewport.height < window.innerHeight * 0.8);
      }
    };

    const handleFocus = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        setIsKeyboardVisible(true);
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (
          !document.activeElement ||
          !(
            document.activeElement instanceof HTMLInputElement ||
            document.activeElement instanceof HTMLTextAreaElement
          )
        ) {
          handleResize();
        }
      }, 100);
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const isScrollingDown = currentScrollY > lastScrollY.current && currentScrollY > 100;

          if (isScrollingDown && visible) {
            setVisible(false);
          } else if (!isScrollingDown && !visible) {
            setVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visible]);

  const handleNav = useCallback(
    (to: string, e: React.MouseEvent) => {
      e.preventDefault();
      if (to === "/sell") {
        setAddMenuOpen(true);
        return;
      }
      void navigate({ to: to as any });
    },
    [navigate],
  );

  const hideNavRoutes = ["/auth", "/welcome"];
  const shouldHide = hideNavRoutes.some((route) => pathname.startsWith(route)) || isKeyboardVisible;

  // 5-item layout for perfect centering of the Plus button.
  // Home, My Store, Plus, Messages, Account
  const items = [
    { id: "home", to: "/app", label: t("home"), Icon: Home },
    { id: "my_store", to: "/my-store", label: t("my_store"), Icon: Store },
    { id: "add", to: "/sell", label: t("add"), Icon: CirclePlus },
    { id: "messages", to: "/messages", label: t("messages"), Icon: MessageSquare },
    { id: "profile", to: "/profile", label: t("profile"), Icon: User },
  ] as const;

  return (
    <>
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background transition-all duration-500 pb-[env(safe-area-inset-bottom)]",
          shouldHide || !visible
            ? "translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100",
        )}
      >
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pt-2 h-16 relative">
          {items.map((item) => {
            const { id, to, label, Icon } = item;
            const active = to === "/app" ? pathname === "/app" : Boolean(to) && pathname.startsWith(to);
            const isAddButton = id === "add";

            return (
              <button
                key={id}
                onClick={(e) => handleNav(to as string, e)}
                className={cn(
                  "press flex flex-1 flex-col items-center justify-center outline-none transition-all relative",
                  active ? "text-primary" : "text-muted-foreground",
                  isAddButton && "z-10",
                )}
              >
                {isAddButton ? (
                  <div className="flex flex-col items-center">
                    <div className="gradient-primary shadow-glow -mt-11 mb-2 flex size-12 items-center justify-center rounded-2xl text-primary-foreground border-4 border-background ring-1 ring-border scale-110">
                      <Icon className="size-7" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-40">
                      {label}
                    </span>
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        "p-1.5 rounded-xl transition-all duration-300 mb-0.5 relative",
                        active ? "bg-primary/10" : "bg-transparent",
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn("size-5 transition-transform", active && "scale-110")}
                        />
                      )}
                      {id === "messages" && unreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-background animate-in zoom-in duration-300 shadow-lg">
                          {unreadMessages > 99 ? "+99" : unreadMessages}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-tighter transition-all duration-300",
                        active ? "opacity-100" : "opacity-40",
                      )}
                    >
                      {label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>
      <AddActionMenu open={addMenuOpen} onOpenChange={setAddMenuOpen} />
    </>
  );
}
