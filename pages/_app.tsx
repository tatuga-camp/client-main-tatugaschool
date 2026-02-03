import "@/styles/globals.css";
import "@/styles/input-phone.css";

import type { AppProps } from "next/app";
import { Prompt } from "next/font/google";
import { PrimeReactProvider } from "primereact/api";
import { PagesProgressBar } from "next-nprogress-bar";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ErrorMessages } from "../interfaces";
import { classNames } from "primereact/utils";
import { useGetUser } from "../react-query";
import { useRouter } from "next/router";

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
            refetchInterval: 2 * 60 * 1000, // 2 minutes
            refetchOnWindowFocus: false, // Disables automatic refetching when browser window is focused.
            retry: (failureCount, error) => {
              let errorResponse = error as unknown as ErrorMessages;
              const errorObj = error as any;
              // Don't retry for certain error responses
              if (
                errorResponse?.statusCode === 401 ||
                errorObj?.message === "Session expired" ||
                errorObj?.message === "Token not found"
              ) {
                return false;
              }
              // Retry others just once
              return failureCount <= 1;
            },
          },
        },
      }),
  );
  const router = useRouter();

  useEffect(() => {
    const returnUrl = localStorage.getItem("returnUrl");
    const pathName = router.pathname;

    if (returnUrl && pathName !== "/auth/sign-up") {
      localStorage.removeItem("returnUrl");
      router.push(returnUrl);
    }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <PrimeReactProvider
        value={{
          unstyled: true,
          pt: {
            global: {
              css(option) {
                return `
              .progressbar-value-animate::after {
                    will-change: left, right;
                    animation: p-progressbar-indeterminate-anim-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
                }
                .progressbar-value-animate::before {
                    will-change: left, right;
                    animation: p-progressbar-indeterminate-anim 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
                }
                @keyframes p-progressbar-indeterminate-anim {
                    0% {
                        left: -35%;
                        right: 100%;
                    }
                    60% {
                        left: 100%;
                        right: -90%;
                    }
                    100% {
                        left: 100%;
                        right: -90%;
                    }
                }

              .progress-spinner-circle {
                  stroke-dasharray: 89, 200;
                  stroke-dashoffset: 0;
                  animation: p-progress-spinner-dash 1.5s ease-in-out infinite, p-progress-spinner-color 6s ease-in-out infinite;
                  stroke-linecap: round;
              }
      
              @keyframes p-progress-spinner-dash{
                  0% {
                      stroke-dasharray: 1, 200;
                      stroke-dashoffset: 0;
                  }
                  
                  50% {
                      stroke-dasharray: 89, 200;
                      stroke-dashoffset: -35px;
                  }
                  100% {
                      stroke-dasharray: 89, 200;
                      stroke-dashoffset: -124px;
                  }
              }
              @keyframes p-progress-spinner-color {
                  100%, 0% {
                      stroke: #ff5757;
                  }
                  40% {
                      stroke: #696cff;
                  }
                  66% {
                      stroke: #1ea97c;
                  }
                  80%, 90% {
                      stroke: #cc8925;
                  }
              }
          `;
              },
            },
            toast: {
              root: {
                className: classNames("w-96", "opacity-90"),
              },
              message: (option: any) => ({
                className: classNames("my-4 rounded-2xl w-full", {
                  "bg-blue-100 border-solid border-0 border-l-4 border-blue-500 text-blue-700":
                    option?.state.messages[option?.index] &&
                    option?.state.messages[option?.index].message.severity ==
                      "info",
                  "bg-green-100 border-solid border-0 border-l-4 border-green-500 text-green-700":
                    option?.state.messages[option?.index as any] &&
                    option?.state.messages[option?.index].message.severity ==
                      "success",
                  "bg-orange-100 border-solid border-0 border-l-4 border-orange-500 text-orange-700":
                    option?.state.messages[option?.index] &&
                    option?.state.messages[option?.index].message.severity ==
                      "warn",
                  "bg-red-100 border-solid border-0 border-l-4 border-red-500 text-red-700":
                    option?.state.messages[option?.index] &&
                    option?.state.messages[option?.index].message.severity ==
                      "error",
                }),
              }),
              content: {
                className: "flex items-center py-5 px-7",
              },
              icon: {
                className: classNames("w-6 h-6", "text-lg mr-2"),
              },
              text: {
                className:
                  "text-base font-normal flex flex-col flex-1 grow shrink ml-4",
              },
              summary: {
                className: "font-bold block",
              },
              detail: {
                className: "mt-1 block",
              },
              closeButton(options) {
                return {
                  className: classNames(
                    "w-8 h-8 rounded-full bg-transparent transition duration-200 ease-in-out",
                    "ml-auto overflow-hidden relative",
                    "flex items-center justify-center",
                    "hover:bg-white/30",
                  ),
                };
              },
              transition: {
                enterFromClass:
                  "opacity-0 translate-x-0 translate-y-2/4 translate-z-0",
                enterActiveClass:
                  "transition-transform transition-opacity duration-300",
                leaveFromClass: "max-h-40",
                leaveActiveClass: "transition-all duration-500 ease-in",
                leaveToClass: "max-h-0 opacity-0 mb-0 overflow-hidden",
              } as any,
            },
            progressbar: {
              root: {
                className: classNames(
                  "overflow-hidden relative",
                  "border-0 h-6 bg-gray-200 rounded-2xl ",
                ),
              },
              value: (option) => ({
                className: classNames("border-0 m-0 bg-blue-500", {
                  "transition-width duration-1000 ease-in-out absolute items-center border-0 flex h-full justify-center overflow-hidden w-0":
                    option?.props.mode !== "indeterminate",
                  "progressbar-value-animate before:absolute before:top-0 before:left-0 before:bottom-0 before:bg-inherit after:absolute after:top-0 after:left-0 after:bottom-0 after:bg-inherit after:delay-1000":
                    option?.props.mode == "indeterminate",
                }),
              }),
              label: {
                className: classNames("inline-flex", "text-white leading-6"),
              },
            },
            progressspinner: {
              root: {
                className: classNames(
                  "relative mx-auto w-28 h-28 inline-block",
                  "before:block before:pt-full",
                ),
              },
              spinner: {
                className:
                  "absolute top-0 bottom-0 left-0 right-0 m-auto w-full h-full transform origin-center animate-spin",
              },
              circle: {
                className: "text-red-500 progress-spinner-circle",
              },
            },
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
