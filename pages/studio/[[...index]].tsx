import dynamic from "next/dynamic";
import Head from "next/head";
import config from "../../sanity.config";

const NextStudio = dynamic(
  () => import("next-sanity/studio").then((mod) => mod.NextStudio),
  { ssr: false },
);

export default function StudioPage() {
  return (
    <>
      <Head>
        <title>Tatuga School Studio</title>
        <meta name="robots" content="noindex" />
      </Head>
      <NextStudio config={config} />
    </>
  );
}
