import ListsSchoolComponent from "@/components/school/ListsSchoolComponent";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { GetServerSideProps } from "next";
import { RefreshTokenService } from "../services";
import Head from "next/head";
import { setAccessToken, getRefetchtoken } from "../utils";
import { subscribeUserToPush } from "@/utils/notifications";
import { SubscribeToPushService } from "@/services/push";
export default function Home() {
  const VAPID_PUBLIC_KEY = 'BDgFAJKY6huXLvQOXLLL2UvVol1mw8lYDmfKDh_6r4MZr4SVBJl1AlcSAxDnN7dS-xVps7E_JQ0z5AbNIumysao';

  const handleSubscribe = async () => {
    const subscription = await subscribeUserToPush(VAPID_PUBLIC_KEY);
    if (subscription) {
      try {
        await SubscribeToPushService(subscription.toJSON());
        alert("Subscribed successfully!");
      } catch (error) {
        alert("Subscription failed!");
      }
    }
  };

  return (
    <>
      <Head>
        <title>Home | Tatuga School</title>
        <meta name="description" content="Tatuga School" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>Push Notifications Example</h1>
      <button onClick={handleSubscribe} className="main-button">
        Enable Push Notifications
      </button>

      <DefaultLayout>
        <ListsSchoolComponent />
      </DefaultLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { refresh_token } = getRefetchtoken(ctx);
    if (!refresh_token) {
      throw new Error("Token not found");
    }
    const accessToken = await RefreshTokenService({
      refreshToken: refresh_token,
    });
    setAccessToken({ access_token: accessToken.accessToken });

    return {
      props: {},
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/auth/sign-in",
        permanent: false,
      },
    };
  }
};
