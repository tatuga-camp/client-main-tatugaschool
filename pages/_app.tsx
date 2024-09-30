import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Prompt } from "@next/font/google";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={prompt.className}>
      {" "}
      {}
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
