import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Prompt } from "@next/font/google";
import { PrimeReactProvider, PrimeReactContext } from "primereact/api";
import { PagesProgressBar } from "next-nprogress-bar";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
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
  );
}

export default MyApp;
