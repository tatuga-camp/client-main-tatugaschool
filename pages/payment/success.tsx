import Head from "next/head";
import StripeLayout from "../../components/layout/StripeLayout";
import ShowStatusPayment from "../../components/payments/ShowStatus";

function Success() {
  return (
    <>
      <Head>
        <title>Tatuga School Member Status</title>
        <meta
          name="description"
          content="Welcome to tatuga school dashboard where teachers are able to manage thier school!"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Tatuga School" />
        <meta
          property="og:description"
          content="Welcome to tatuga school dashboard where teachers are able to manage thier school!"
        />
        <meta property="og:site_name" content="Tatuga School" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/icon.svg" />

        <meta property="twitter:title" content="Tatuga School" />
        <meta
          property="twitter:description"
          content="Welcome to tatuga school dashboard where teachers are able to manage thier school!"
        />

        <meta property="twitter:image" content="/icon.svg" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <StripeLayout>
        <ShowStatusPayment />
      </StripeLayout>
    </>
  );
}
export default Success;
