import { useStripe } from "@stripe/react-stripe-js";
import { PaymentIntent } from "@stripe/stripe-js";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { defaultCanvas } from "../../data";
import AnimationFireworkEffect from "../animation/AnimationFireworkEffect";

function ShowStatusPayment() {
  const stripe = useStripe();
  const [message, setMessage] = useState<string>();
  const [status, setStatus] = useState<PaymentIntent.Status>();
  const router = useRouter();
  useEffect(() => {
    if (!stripe) {
      return;
    }
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
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
        className={`
    ${
      status === "succeeded"
        ? "gradient-bg"
        : "bg-gradient-to-r from-rose-400 to-red-500 "
    }
    w-screen font-Anuphan h-screen flex flex-col gap-5 items-center   justify-center`}
      >
        <div className="flex items-center justify-center bg-white px-3 rounded-full py-1 gap-1 md:gap-2">
          <div
            className="w-6 h-6 rounded-md overflow-hidden ring-1 ring-white
         relative hover:scale-105 active:scale-110 transition duration-150"
          >
            <Image
              src="/favicon.ico"
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              alt="logo tatuga school"
            />
          </div>
          <div className="font-bold uppercase  block text-lg md:text-base text-icon-color">
            Tatuga School
          </div>
        </div>
        <div
          className="w-80 md:w-96  bg-white rounded-lg p-5 drop-shadow-md
         border flex items-center justify-center flex-col gap-2"
        >
          <div className="border-b w-full text-center">{status}</div>
          <span className="text-gray-500">{message}</span>

          <div className="w-full flex items-center justify-center gap-3">
            <button
              onClick={() => {
                router.back();
              }}
              className="second-button flex items-center justify-center border w-40"
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
