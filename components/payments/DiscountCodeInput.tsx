import React, { useState } from "react";
import { useGetLanguage, useValidateDiscount } from "../../react-query";
import { DiscountDataLanguage } from "../../data/languages/discount";
import LoadingSpinner from "../common/LoadingSpinner";

export type DiscountValidation = {
  code: string;
  discount: { type: "percent" | "amount"; value: number };
  originalAmount: number;
  discountedAmount: number;
  currency: string;
};

type Props = {
  mode: "new" | "renewal";
  schoolId: string;
  priceId?: string;
  members?: number;
  onValidated: (result: DiscountValidation | null) => void;
};

function DiscountCodeInput({
  mode,
  schoolId,
  priceId,
  members,
  onValidated,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const validateDiscount = useValidateDiscount();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<DiscountValidation | null>(null);

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setError(null);
    try {
      const result = await validateDiscount.mutateAsync({
        code: trimmed,
        schoolId,
        priceId,
        members,
      });
      if (result.valid) {
        const validation: DiscountValidation = {
          code: trimmed,
          discount: result.discount,
          originalAmount: result.originalAmount,
          discountedAmount: result.discountedAmount,
          currency: result.currency,
        };
        setApplied(validation);
        onValidated(validation);
      } else {
        setApplied(null);
        setError(result.reason);
        onValidated(null);
      }
    } catch (e) {
      setApplied(null);
      setError(DiscountDataLanguage.genericError(lang));
      onValidated(null);
    }
  };

  return (
    <div className="flex flex-col gap-1 font-Anuphan">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (applied) {
              setApplied(null);
              onValidated(null);
            }
            setError(null);
          }}
          placeholder={DiscountDataLanguage.placeholder(lang)}
          aria-label={DiscountDataLanguage.discountCodeLabel(lang)}
          className="grow rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-primary-color"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={validateDiscount.isPending || code.trim().length === 0}
          className="second-button flex w-24 items-center justify-center border disabled:opacity-50"
        >
          {validateDiscount.isPending ? (
            <LoadingSpinner />
          ) : (
            DiscountDataLanguage.applyButton(lang)
          )}
        </button>
      </div>
      {applied && (
        <span className="text-sm font-semibold text-success-color">
          ✓ {DiscountDataLanguage.discountLabel(lang, applied.discount, mode)}
        </span>
      )}
      {error && <span className="text-sm text-error-color">{error}</span>}
    </div>
  );
}

export default DiscountCodeInput;
