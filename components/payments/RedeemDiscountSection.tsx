import React, { useState } from "react";
import Swal from "sweetalert2";
import DiscountCodeInput, { DiscountValidation } from "./DiscountCodeInput";
import { ErrorMessages, School } from "../../interfaces";
import { useApplyDiscount, useGetLanguage } from "../../react-query";
import { DiscountDataLanguage } from "../../data/languages/discount";
import LoadingSpinner from "../common/LoadingSpinner";

type Props = {
  school: School;
};

function RedeemDiscountSection({ school }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const applyDiscount = useApplyDiscount();
  const [validation, setValidation] = useState<DiscountValidation | null>(
    null,
  );

  const handleApplyToPlan = async () => {
    if (!validation) return;
    try {
      await applyDiscount.mutateAsync({
        code: validation.code,
        schoolId: school.id,
      });
      setValidation(null);
      Swal.fire({
        title: DiscountDataLanguage.appliedTitle(lang),
        text: DiscountDataLanguage.appliedText(lang),
        icon: "success",
      });
    } catch (error) {
      const result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message?.toString() ?? "",
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <div className="mt-8 w-full max-w-md rounded-2xl border bg-white p-5 font-Anuphan">
      <h3 className="text-lg font-medium">
        {DiscountDataLanguage.sectionTitle(lang)}
      </h3>
      <p className="mb-3 text-xs text-gray-500 sm:text-sm">
        {DiscountDataLanguage.renewalHint(lang)}
      </p>
      <DiscountCodeInput
        mode="renewal"
        schoolId={school.id}
        onValidated={setValidation}
      />
      <button
        type="button"
        disabled={!validation || applyDiscount.isPending}
        onClick={handleApplyToPlan}
        className="main-button mt-3 flex h-10 w-full items-center justify-center disabled:opacity-50"
      >
        {applyDiscount.isPending ? (
          <LoadingSpinner />
        ) : (
          DiscountDataLanguage.applyToPlanButton(lang)
        )}
      </button>
    </div>
  );
}

export default RedeemDiscountSection;
