import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Prompt } from "@next/font/google";
import { PrimeReactProvider, PrimeReactContext } from "primereact/api";
import { PagesProgressBar } from "next-nprogress-bar";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
            staleTime: 1000 * 60 * 60, // 1 hour in ms
            refetchOnMount: false, // Disables automatic refetching when component is mounted.removed
            refetchOnWindowFocus: false, // Disables automatic refetching when browser window is focused.
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <PrimeReactProvider>
        <PagesProgressBar
          height="4px"
          color="#6149CD"
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
