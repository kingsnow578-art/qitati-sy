import React, { createContext, useContext, useState } from "react";

interface AppLoadingContextType {
  isAppLoading: boolean;
  setIsAppLoading: (loading: boolean) => void;
}

const AppLoadingContext = createContext<AppLoadingContextType | undefined>(undefined);

export function AppLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isAppLoading, setIsAppLoading] = useState(true);

  return (
    <AppLoadingContext.Provider value={{ isAppLoading, setIsAppLoading }}>
      {children}
    </AppLoadingContext.Provider>
  );
}

export function useAppLoading() {
  const context = useContext(AppLoadingContext);
  if (!context) throw new Error("useAppLoading must be used within AppLoadingProvider");
  return context;
}
