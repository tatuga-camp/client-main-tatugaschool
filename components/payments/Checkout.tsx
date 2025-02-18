import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  StripeExpressCheckoutElementOptions,
} from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

function PaymentForm(props: { email: string }) {
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
        return_url: "http://localhost:8181/payment/success",
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
      className="flex flex-col gap-3"
      onSubmit={handleSubmit}
    >
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
        className="main-button"
        disabled={isLoading || !stripe || !elements}
        id="submit"
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}

export default function CheckoutForm({
  clientSecret,
  email,
}: {
  clientSecret: string;
  email: string;
}) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: "stripe",
        },
        clientSecret,
      }}
    >
      <PaymentForm email={email} />
    </Elements>
  );
}
