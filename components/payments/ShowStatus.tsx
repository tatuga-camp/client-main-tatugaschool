import { useStripe } from "@stripe/react-stripe-js";
import { PaymentIntent } from "@stripe/stripe-js";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { defaultCanvas } from "../../data";
import AnimationFireworkEffect from "../animation/AnimationFireworkEffect";
import { useQueryClient } from "@tanstack/react-query";

function ShowStatusPayment() {
  const stripe = useStripe();
  const [message, setMessage] = useState<string>();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PaymentIntent.Status>();
  const router = useRouter();
  useEffect(() => {
    if (!stripe) {
      return;
    }
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret",
    );
    if (!clientSecret) {
      return;
    }
    if (stripe && router.isReady) {
      stripe
        .retrievePaymentIntent(clientSecret)
        .then(async ({ paymentIntent }) => {
          setStatus(paymentIntent?.status);
          switch (paymentIntent?.status) {
            case "succeeded":
              setMessage("Payment succeeded!");
              break;
            default:
              setMessage("Please Retry Your Payment Again");
              break;
          }
        });
    }
  }, [stripe, router.isReady]);

  return (
    <>
      {status === "succeeded" && <AnimationFireworkEffect />}
      <main
        className={` ${
          status === "succeeded"
            ? "gradient-bg"
            : "bg-gradient-to-r from-rose-400 to-red-500"
        } flex h-screen w-screen flex-col items-center justify-center gap-5 font-Anuphan`}
      >
        <div className="flex items-center justify-center gap-1 rounded-full bg-white px-3 py-1 md:gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-2xl ring-1 ring-white transition duration-150 hover:scale-105 active:scale-110">
            <Image
              src="/favicon.ico"
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              alt="logo tatuga school"
            />
          </div>
          <div className="block text-lg font-bold uppercase text-icon-color md:text-base">
            Tatuga School
          </div>
        </div>
        <div className="flex w-80 flex-col items-center justify-center gap-2 rounded-2xl border bg-white p-5 drop-shadow-md md:w-96">
          <div className="w-full border-b text-center">{status}</div>
          <span className="text-gray-500">{message}</span>

          <div className="flex w-full items-center justify-center gap-3">
            <button
              onClick={() => {
                queryClient.refetchQueries({
                  queryKey: ["school"],
                });
                router.back();
              }}
              className="second-button flex w-40 items-center justify-center border"
            >
              BACK
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default ShowStatusPayment;
