import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  clientSecret?: string;
};
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);
function StripeLayout({ children, clientSecret }: LayoutProps) {
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
      {children}
    </Elements>
  );
}

export default StripeLayout;
