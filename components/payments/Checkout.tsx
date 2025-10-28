import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React, { useState } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import StripeLayout from "../layout/StripeLayout";
import Image from "next/image";
import { defaultCanvas } from "../../data";

function PaymentForm(props: {
  email: string;
  product: { price: string; title: string; time: string };
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message as string);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form
      id="payment-form"
      className="flex flex-col gap-3 font-Anuphan md:flex-row"
      onSubmit={handleSubmit}
    >
      <div className="flex w-max flex-col items-center justify-center p-2">
        <div className="flex items-center justify-center gap-1 border-b px-3 py-1 md:gap-2">
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
            Tatuga School Member
          </div>
        </div>
        <span className="font-semibold text-primary-color">
          {props.product.title}
        </span>
        <div className="gradient-bg flex w-20 items-center justify-center rounded-sm text-sm font-semibold uppercase text-white">
          {props.product.time}
        </div>
        <span className="font-bold underline">
          Price: {props.product.price}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <PaymentElement
          id="payment-element"
          options={{
            layout: "accordion",
            defaultValues: {
              billingDetails: {
                email: props.email,
              },
            },
          }}
        />
        <button
          className="main-button flex h-10 w-full items-center justify-center"
          disabled={isLoading || !stripe || !elements}
          id="submit"
        >
          <span id="button-text">
            {isLoading ? <LoadingSpinner /> : "Pay now"}
          </span>
        </button>
      </div>
      {/* Show any error or success messages */}
      {message && (
        <div id="payment-message" className="text-red-700">
          {message}
        </div>
      )}
    </form>
  );
}

export default function CheckoutForm({
  clientSecret,
  email,
  product,
}: {
  clientSecret: string;
  email: string;
  product: { price: string; title: string; time: string };
}) {
  return (
    <StripeLayout clientSecret={clientSecret}>
      <PaymentForm email={email} product={product} />
    </StripeLayout>
  );
}
