import React, { useEffect, useRef, useState } from "react";
import {
  useCreateSubscription,
  useGetLanguage,
  useGetMemberOnSchoolBySchool,
  useGetSchool,
  useManageSubscription,
  useUpdateSchool,
  useUpgradeSubscription,
} from "../../react-query";
import { ErrorMessages, MemberOnSchool } from "../../interfaces";
import Swal from "sweetalert2";
import PopupLayout from "../layout/PopupLayout";
import CheckoutForm from "../payments/Checkout";
import { RiBillFill } from "react-icons/ri";
import { useRouter } from "next/router";
import LoadingSpinner from "../common/LoadingSpinner";
import SubscriptionPlan from "../payments/SubscriptionPlan";
import ConfirmSubscriptionModal from "../payments/ConfirmSubscriptionModal";
import RedeemDiscountSection from "../payments/RedeemDiscountSection";
import UpgradePlanModal from "../payments/UpgradePlanModal";
import Dropdown from "../common/Dropdown";
import { Toast } from "primereact/toast";
import { useSound } from "../../hook";
import { schoolDataLanguage } from "../../data/languages";
import useGetRoleOnSchool from "../../hook/useGetRoleOnSchool";

const BillingPlanSection = (props: { schoolId: string }) => {
  const role = useGetRoleOnSchool({
    schoolId: props.schoolId,
  });
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const song = useSound("/sounds/ding.mp3") as HTMLAudioElement;
  const school = useGetSchool({ schoolId: props.schoolId });
  const members = useGetMemberOnSchoolBySchool({
    schoolId: props.schoolId,
  });
  const updateSchool = useUpdateSchool();
  const language = useGetLanguage();
  const [selectBillingManager, setSelectBillingManager] =
    useState<MemberOnSchool>();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectProduct, setSelectProduct] = useState<{
    title: string;
    time: string;
    price: string;
  }>();
  const [pendingPlan, setPendingPlan] = useState<{
    priceId: string;
    product: { title: string; time: string; price: string };
    members: number;
  } | null>(null);
  const [pendingUpgrade, setPendingUpgrade] = useState<{
    priceId: string;
    productTitle: string;
    time: string;
    isEnterprise: boolean;
    members: number;
  } | null>(null);

  useEffect(() => {
    if (members.data && school.data) {
      const currentBillingManager = members.data.find(
        (m) => m.userId === school.data.billingManagerId,
      );
      setSelectBillingManager(() => currentBillingManager);
    }
  }, [members.data, school.data]);
  const managesubscription = useManageSubscription();
  const createSubscription = useCreateSubscription();
  const upgradeSubscription = useUpgradeSubscription();
  const handleCreateSubscription = async ({
    priceId,
    product,
    members = 1,
    discountCode,
  }: {
    priceId: string;
    product: { title: string; time: string; price: string };
    members: number;
    discountCode?: string;
  }) => {
    try {
      const create = await createSubscription.mutateAsync({
        schoolId: props.schoolId,
        priceId: priceId,
        members: members,
        discountCode: discountCode,
      });
      if (create.clientSecret === null) {
        Swal.fire({
          title: "Subscription Active",
          text: "No payment was required for this subscription.",
          icon: "success",
        });
        document.body.style.overflow = "auto";
        setTimeout(() => {
          school.refetch();
        }, 2000);
        return;
      }
      setClientSecret(create.clientSecret);
      setSelectProduct(() => {
        return {
          ...product,
          price: (create.price / 100).toLocaleString(),
        };
      });
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

  const handleUpgrade = async ({
    priceId,
    members,
    productTitle,
    time,
  }: {
    priceId: string;
    members: number;
    productTitle: string;
    time: string;
  }) => {
    try {
      const result = await upgradeSubscription.mutateAsync({
        schoolId: props.schoolId,
        priceId,
        members,
      });
      if (result.clientSecret === null) {
        Swal.fire({
          title: "Upgrade Complete",
          text: "Your plan has been upgraded. No payment was required.",
          icon: "success",
        });
        document.body.style.overflow = "auto";
        setTimeout(() => {
          school.refetch();
        }, 2000);
        return;
      }
      setClientSecret(result.clientSecret);
      setSelectProduct({
        title: productTitle,
        time: time,
        price: (result.price / 100).toLocaleString(),
      });
    } catch (error) {
      document.body.style.overflow = "auto";
      console.log(error);
      const result = error as ErrorMessages;
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

  const handleChangeBillingManager = async (data: MemberOnSchool) => {
    try {
      setSelectBillingManager(() => data);

      await updateSchool.mutateAsync({
        query: {
          schoolId: data.schoolId,
        },
        body: {
          billingManagerId: data.userId,
        },
      });
      song.play();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Billing Manager Updated",
        life: 3000,
      });
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
      <Toast ref={toast} />
      {(createSubscription.isPending || upgradeSubscription.isPending) && (
        <PopupLayout onClose={() => {}}>
          <div className="flex h-screen w-screen items-center justify-center bg-white/80">
            <LoadingSpinner />
          </div>
        </PopupLayout>
      )}
      {clientSecret && school.data && selectProduct && (
        <PopupLayout onClose={() => setClientSecret(null)}>
          <div id="checkout" className="rounded-2xl bg-white p-5">
            <CheckoutForm
              product={selectProduct}
              clientSecret={clientSecret}
              email={school.data?.user.email}
            />
          </div>
        </PopupLayout>
      )}
      {pendingPlan && school.data && (
        <ConfirmSubscriptionModal
          school={school.data}
          plan={pendingPlan}
          onCancel={() => setPendingPlan(null)}
          onConfirm={(discountCode) => {
            const plan = pendingPlan;
            setPendingPlan(null);
            handleCreateSubscription({
              priceId: plan.priceId,
              product: plan.product,
              members: plan.members,
              discountCode,
            });
          }}
        />
      )}
      {pendingUpgrade && school.data && (
        <UpgradePlanModal
          school={school.data}
          target={{
            priceId: pendingUpgrade.priceId,
            productTitle: pendingUpgrade.productTitle,
            isEnterprise: pendingUpgrade.isEnterprise,
          }}
          initialMembers={pendingUpgrade.members}
          onCancel={() => setPendingUpgrade(null)}
          onConfirm={(payload) => {
            const up = pendingUpgrade;
            setPendingUpgrade(null);
            handleUpgrade({
              priceId: payload.priceId,
              members: payload.members,
              productTitle: up.productTitle,
              time: up.time,
            });
          }}
        />
      )}
      <div className="w-full rounded-2xl border bg-white p-5 2xl:p-10">
        <h1 className="text-lg font-medium sm:text-xl">
          {schoolDataLanguage.manageSubTitle(language.data ?? "en")}
        </h1>
        <h4 className="text-xs text-gray-500 sm:text-sm">
          {schoolDataLanguage.manageSubDescription(language.data ?? "en")}
        </h4>
        <div className="mt-5">
          <button
            disabled={managesubscription.isPending}
            onClick={() => hanldeManageSubscription()}
            className="second-button flex w-60 items-center justify-center border"
          >
            {managesubscription.isPending ? (
              <LoadingSpinner />
            ) : (
              <>
                <RiBillFill />
                {schoolDataLanguage.billingButton(language.data ?? "en")}
              </>
            )}
          </button>
        </div>
        <h1 className="mt-10 text-lg font-medium sm:text-xl">
          {schoolDataLanguage.billingManagerTitle(language.data ?? "en")}
        </h1>
        <h4 className="text-xs text-gray-500 sm:text-sm">
          {schoolDataLanguage.billingManagerDescription(language.data ?? "en")}
        </h4>
        <div className="w-full max-w-96">
          {selectBillingManager && members.data && (
            <Dropdown<MemberOnSchool>
              optionLabel="email"
              disabled={role === "TEACHER"}
              value={selectBillingManager}
              onChange={(e) => {
                handleChangeBillingManager(e.value);
              }}
              options={members.data}
              placeholder="select your billing manager"
            />
          )}
        </div>
        {school.data?.stripe_subscription_id && (
          <RedeemDiscountSection school={school.data} />
        )}
        {school.data && (
          <SubscriptionPlan
            onSelectPlan={(priceId, product, members, isUpgrade) => {
              if (isUpgrade) {
                setPendingUpgrade({
                  priceId,
                  productTitle: product.title,
                  time: product.time,
                  isEnterprise: product.title === "Tatuga School Enterprise",
                  members,
                });
              } else {
                setPendingPlan({ priceId, product, members });
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
