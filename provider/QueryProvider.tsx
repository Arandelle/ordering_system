'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryclient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache kept in memory for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Refetch when user comes back to tab
            refetchOnWindowFocus: true,
            // Refetch when internet reconnects
            refetchOnReconnect: true,
            // Retry failed requests 3 time with exponential backoff
            retry: 3,
            // Don't refetch on mount when data is fresh
            refetchOnMount: false,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryclient}>
      {children}
      {/** DevTools - only shows in development */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />{" "}
    </QueryClientProvider>
  );
}
