import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Prompt } from "@next/font/google";
import { PrimeReactProvider, PrimeReactContext } from "primereact/api";
import { PagesProgressBar } from "next-nprogress-bar";
import { useState } from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Tailwind from "primereact/passthrough/tailwind";
import { twMerge } from "tailwind-merge";

import { ErrorMessages } from "../interfaces";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000, // 2 minutes
            refetchOnMount: false, // Disables automatic refetching when component is mounted.removed
            refetchOnWindowFocus: false, // Disables automatic refetching when browser window is focused.
            retry: (failureCount, error) => {
              let errorResponse = error as unknown as ErrorMessages;
              // Don't retry for certain error responses
              if (errorResponse.statusCode === 401) {
                return false;
              }
              // Retry others just once
              return failureCount <= 1;
            },
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <PrimeReactProvider
        value={{
          unstyled: true,
          pt: Tailwind,
          ptOptions: {
            mergeSections: true,
            mergeProps: true,
            classNameMergeFunction: twMerge,
          },
        }}
      >
        <PagesProgressBar
          height="4px"
          color="#D2122E"
          options={{ showSpinner: false }}
          shallowRouting
        />
        <div className={prompt.className}>
          <Component {...pageProps} />
        </div>
      </PrimeReactProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
