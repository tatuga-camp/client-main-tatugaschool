import React, { useEffect, useRef, useState } from "react";
import {
  useCreateSubscription,
  useGetLanguage,
  useGetMemberOnSchoolBySchool,
  useGetSchool,
  useManageSubscription,
  useUpdateSchool,
} from "../../react-query";
import { ErrorMessages, MemberOnSchool } from "../../interfaces";
import Swal from "sweetalert2";
import PopupLayout from "../layout/PopupLayout";
import CheckoutForm from "../payments/Checkout";
import { RiBillFill } from "react-icons/ri";
import { useRouter } from "next/router";
import LoadingSpinner from "../common/LoadingSpinner";
import SubscriptionPlan from "../payments/SubscriptionPlan";
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
  const handleCreateSubscription = async ({
    priceId,
    product,
    members = 1,
  }: {
    priceId: string;
    product: { title: string; time: string; price: string };
    members: number;
  }) => {
    try {
      const create = await createSubscription.mutateAsync({
        schoolId: props.schoolId,
        priceId: priceId,
        members: members,
      });
      if (create.clientSecret === null) {
        Swal.fire({
          title: "Request Complete",
          text: "You have paid by your own credit from previous subscription",
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
      {createSubscription.isPending && (
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
        <div className="w-96">
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
        {school.data && (
          <SubscriptionPlan
            onSelectPlan={(priceId, product, members) => {
              if (confirm("Are you confirm to pay?")) {
                handleCreateSubscription({
                  priceId,
                  product: product,
                  members,
                });
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
