import React, { useEffect, useState } from "react";
import PopupLayout from "../layout/PopupLayout";
import { School } from "../../interfaces";
import { useGetLanguage, useRenewalPreview } from "../../react-query";
import { ResponseRenewalPreviewService } from "../../services";
import { RenewDataLanguage } from "../../data/languages/renew";
import LoadingSpinner from "../common/LoadingSpinner";

type Props = {
  school: School;
  onConfirm: (preview: { plan: string; interval: string }) => void;
  onCancel: () => void;
};

function RenewPlanModal({ school, onConfirm, onCancel }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const renewalPreview = useRenewalPreview();
  const [preview, setPreview] =
    useState<ResponseRenewalPreviewService | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    renewalPreview
      .mutateAsync({ schoolId: school.id })
      .then((result) => {
        if (!cancelled) setPreview(result);
      })
      .catch(() => {
        if (!cancelled) {
          setPreview(null);
          setError(RenewDataLanguage.genericError(lang));
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validPreview = preview && preview.valid ? preview : null;
  const daysLeft = validPreview
    ? Math.max(
        1,
        Math.ceil(
          (new Date(validPreview.currentExpireAt).getTime() - Date.now()) /
            86_400_000,
        ),
      )
    : 0;

  return (
    <PopupLayout onClose={onCancel}>
      <div className="mx-4 flex w-full max-w-96 flex-col gap-4 rounded-2xl bg-white p-6 font-Anuphan md:mx-0">
        <h2 className="text-lg font-semibold text-icon-color">
          {RenewDataLanguage.modalTitle(lang)}
        </h2>

        <div className="rounded-xl border bg-background-color p-3 text-center font-semibold text-primary-color">
          {validPreview ? validPreview.plan : ""}
        </div>

        {renewalPreview.isPending && (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
            <LoadingSpinner />
            <span>{RenewDataLanguage.calculating(lang)}</span>
          </div>
        )}

        {error && <span className="text-sm text-error-color">{error}</span>}

        {!renewalPreview.isPending && preview && !preview.valid && (
          <span className="text-sm text-error-color">{preview.reason}</span>
        )}

        {!renewalPreview.isPending && validPreview && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span>{RenewDataLanguage.fullPriceLine(lang)}</span>
              <span>
                {(validPreview.fullPrice / 100).toLocaleString()}฿
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{RenewDataLanguage.creditLine(lang, daysLeft)}</span>
              <span>−{(validPreview.credit / 100).toLocaleString()}฿</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>{RenewDataLanguage.dueToday(lang)}</span>
              <span className="text-primary-color">
                {(validPreview.amountDue / 100).toLocaleString()}฿
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              onCancel();
            }}
            className="second-button flex w-28 items-center justify-center border"
          >
            {RenewDataLanguage.cancelButton(lang)}
          </button>
          <button
            type="button"
            disabled={!validPreview || renewalPreview.isPending}
            onClick={() =>
              validPreview &&
              onConfirm({
                plan: validPreview.plan,
                interval: validPreview.interval,
              })
            }
            className="main-button flex w-40 items-center justify-center disabled:opacity-50"
          >
            {RenewDataLanguage.confirmButton(lang)}
          </button>
        </div>
      </div>
    </PopupLayout>
  );
}

export default RenewPlanModal;
