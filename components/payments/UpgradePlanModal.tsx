import React, { useEffect, useState } from "react";
import PopupLayout from "../layout/PopupLayout";
import { School } from "../../interfaces";
import { useGetLanguage, useUpgradePreview } from "../../react-query";
import { ResponseUpgradePreviewService } from "../../services";
import { UpgradeDataLanguage } from "../../data/languages/upgrade";
import LoadingSpinner from "../common/LoadingSpinner";
import InputNumber from "../common/InputNumber";

type Props = {
  school: School;
  target: {
    priceId: string;
    productTitle: string;
    isEnterprise: boolean;
  };
  initialMembers: number;
  onConfirm: (payload: { priceId: string; members: number }) => void;
  onCancel: () => void;
};

function UpgradePlanModal({
  school,
  target,
  initialMembers,
  onConfirm,
  onCancel,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const upgradePreview = useUpgradePreview();
  const [members, setMembers] = useState(
    target.isEnterprise ? Math.max(4, initialMembers) : 1,
  );
  const [preview, setPreview] = useState<ResponseUpgradePreviewService | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setError(null);
    upgradePreview
      .mutateAsync({
        schoolId: school.id,
        priceId: target.priceId,
        members: target.isEnterprise ? members : undefined,
      })
      .then((result) => {
        if (!cancelled) setPreview(result);
      })
      .catch(() => {
        if (!cancelled) {
          setPreview(null);
          setError(UpgradeDataLanguage.genericError(lang));
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  const validPreview = preview && preview.valid ? preview : null;

  return (
    <PopupLayout onClose={onCancel}>
      <div className="flex w-full max-w-96 flex-col gap-4 rounded-2xl bg-white p-6 mx-4 md:mx-0 font-Anuphan">
        <h2 className="text-lg font-semibold text-icon-color">
          {UpgradeDataLanguage.modalTitle(lang)}
        </h2>

        <div className="rounded-xl border bg-background-color p-3 text-center font-semibold text-primary-color">
          {validPreview
            ? `${validPreview.currentPlan} → ${validPreview.newPlan}`
            : target.productTitle}
        </div>

        {target.isEnterprise && (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {UpgradeDataLanguage.membersLabel(lang)}
            </span>
            <InputNumber
              placeholder={UpgradeDataLanguage.membersLabel(lang)}
              min={4}
              max={500}
              value={members}
              onValueChange={() => {}}
              onChange={(value) => {
                if (value > 3 && value <= 500) {
                  setMembers(value);
                } else if (value < 4) {
                  setMembers(4);
                } else if (value > 500) {
                  setMembers(500);
                }
              }}
            />
          </div>
        )}

        {upgradePreview.isPending && (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
            <LoadingSpinner />
            <span>{UpgradeDataLanguage.calculating(lang)}</span>
          </div>
        )}

        {error && <span className="text-sm text-error-color">{error}</span>}

        {!upgradePreview.isPending && preview && !preview.valid && (
          <span className="text-sm text-error-color">{preview.reason}</span>
        )}

        {!upgradePreview.isPending && validPreview && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span>{UpgradeDataLanguage.newPlanLine(lang)}</span>
              <span>
                {(validPreview.prorationCharge / 100).toLocaleString()}฿
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                {UpgradeDataLanguage.creditLine(lang, validPreview.currentPlan)}
              </span>
              <span>
                −{(validPreview.prorationCredit / 100).toLocaleString()}฿
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>{UpgradeDataLanguage.dueToday(lang)}</span>
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
            {UpgradeDataLanguage.cancelButton(lang)}
          </button>
          <button
            type="button"
            disabled={!validPreview || upgradePreview.isPending}
            onClick={() => onConfirm({ priceId: target.priceId, members })}
            className="main-button flex w-40 items-center justify-center disabled:opacity-50"
          >
            {UpgradeDataLanguage.confirmButton(lang)}
          </button>
        </div>
      </div>
    </PopupLayout>
  );
}

export default UpgradePlanModal;
