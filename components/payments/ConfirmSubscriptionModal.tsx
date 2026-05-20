import React, { useState } from "react";
import PopupLayout from "../layout/PopupLayout";
import DiscountCodeInput, { DiscountValidation } from "./DiscountCodeInput";
import { School } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import { DiscountDataLanguage } from "../../data/languages/discount";

type Props = {
  school: School;
  plan: {
    priceId: string;
    product: { price: string; title: string; time: string };
    members: number;
  };
  onConfirm: (discountCode?: string) => void;
  onCancel: () => void;
};

function ConfirmSubscriptionModal({
  school,
  plan,
  onConfirm,
  onCancel,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [validation, setValidation] = useState<DiscountValidation | null>(
    null,
  );

  return (
    <PopupLayout onClose={onCancel}>
      <div className="flex w-96 flex-col gap-4 rounded-2xl bg-white p-6 font-Anuphan">
        <h2 className="text-lg font-semibold text-icon-color">
          {DiscountDataLanguage.modalTitle(lang)}
        </h2>

        <div className="rounded-xl border bg-background-color p-3">
          <div className="font-semibold text-primary-color">
            {plan.product.title}
          </div>
          <div className="text-sm uppercase text-gray-500">
            {plan.product.time}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {DiscountDataLanguage.discountCodeLabel(lang)}
          </span>
          <DiscountCodeInput
            mode="new"
            schoolId={school.id}
            priceId={plan.priceId}
            members={plan.members}
            onValidated={setValidation}
          />
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-medium">
            {DiscountDataLanguage.totalToday(lang)}
          </span>
          <span className="flex items-center gap-2">
            {validation && (
              <span className="text-gray-400 line-through">
                {(validation.originalAmount / 100).toLocaleString()}฿
              </span>
            )}
            <span className="text-lg font-bold text-primary-color">
              {validation
                ? `${(validation.discountedAmount / 100).toLocaleString()}฿`
                : plan.product.price}
            </span>
          </span>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              onCancel();
            }}
            className="second-button flex w-28 items-center justify-center border"
          >
            {DiscountDataLanguage.cancelButton(lang)}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(validation?.code)}
            className="main-button flex w-40 items-center justify-center"
          >
            {DiscountDataLanguage.confirmPayButton(lang)}
          </button>
        </div>
      </div>
    </PopupLayout>
  );
}

export default ConfirmSubscriptionModal;
