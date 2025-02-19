import React, { useState } from "react";
import {
  useCreateSubscription,
  useGetSchool,
  useManageSubscription,
} from "../../react-query";
import { ErrorMessages } from "../../interfaces";
import Swal from "sweetalert2";
import PopupLayout from "../layout/PopupLayout";
import CheckoutForm from "../payments/Checkout";
import { RiBillFill } from "react-icons/ri";
import { useRouter } from "next/router";
import LoadingSpinner from "../common/LoadingSpinner";
import SubscriptionPlan from "../payments/SubscriptionPlan";

const BillingPlanSection = (props: { schoolId: string }) => {
  const router = useRouter();
  const school = useGetSchool({ schoolId: props.schoolId });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectProduct, setSelectProduct] = useState<{
    title: string;
    time: string;
    price: string;
  }>();
  const managesubscription = useManageSubscription();
  const createSubscription = useCreateSubscription();
  const handleCreateSubscription = async ({
    priceId,
    product,
  }: {
    priceId: string;
    product: { title: string; time: string; price: string };
  }) => {
    try {
      const create = await createSubscription.mutateAsync({
        schoolId: props.schoolId,
        priceId: priceId,
      });
      setClientSecret(create.clientSecret);
      setSelectProduct(product);
    } catch (error) {
      document.body.style.overflow = "auto";
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const hanldeManageSubscription = async () => {
    try {
      const url = await managesubscription.mutateAsync({
        schoolId: props.schoolId,
      });
      router.push(url.url);
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <>
      {createSubscription.isPending && (
        <PopupLayout onClose={() => {}}>
          <div className="w-screen h-screen flex items-center justify-center bg-white/80">
            <LoadingSpinner />
          </div>
        </PopupLayout>
      )}
      {clientSecret && school.data && selectProduct && (
        <PopupLayout onClose={() => setClientSecret(null)}>
          <div id="checkout" className="bg-white p-5 rounded-md">
            <CheckoutForm
              product={selectProduct}
              clientSecret={clientSecret}
              email={school.data?.user.email}
            />
          </div>
        </PopupLayout>
      )}
      <div className="w-full rounded-md bg-white border 2xl:p-10">
        <h1 className="text-lg sm:text-xl font-medium">
          Manage Your Subscription
        </h1>
        <h4 className="text-xs sm:text-sm text-gray-500">
          You can dowload invoice, recipet or manage your subscription here
        </h4>
        <div className="mt-5">
          <button
            disabled={managesubscription.isPending}
            onClick={() => hanldeManageSubscription()}
            className="second-button w-40 flex items-center justify-center border"
          >
            {managesubscription.isPending ? (
              <LoadingSpinner />
            ) : (
              <>
                <RiBillFill />
                Billing Setting
              </>
            )}
          </button>
        </div>

        {school.data && (
          <SubscriptionPlan
            onSelectPlan={(priceId, product) => {
              if (confirm("Are you confirm to pay?")) {
                handleCreateSubscription({ priceId, product: product });
              }
            }}
            school={school.data}
          />
        )}
      </div>
    </>
  );
};

export default BillingPlanSection;
