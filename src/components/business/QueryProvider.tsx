"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRef } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<QueryClient>(null);
  if (!clientRef.current) {
    clientRef.current = new QueryClient({
      defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
    });
  }
  return (
    <QueryClientProvider client={clientRef.current}>{children}</QueryClientProvider>
  );
}
