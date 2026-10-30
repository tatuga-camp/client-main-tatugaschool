import React, { useRef } from "react";
import { Toast } from "primereact/toast";
import { useGetLanguage } from "../../react-query/language";
import { feedbackLanguageData } from "../../data/languages";
import { FeedbackRewardResult } from "../../interfaces";
import { formatRewardDate } from "../../utils/feedbackReward";

type FeedbackThankYouProps = {
  reward: FeedbackRewardResult | null;
  email?: string;
};

function CheckIcon() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#16a34a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </div>
  );
}

function DetailRow({
  badge,
  children,
}: {
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5 text-left text-sm text-gray-700">
      <div className="flex h-5 w-5 flex-none items-center justify-center rounded-md bg-gray-100 text-[11px] font-extrabold text-primary-color">
        {badge}
      </div>
      <div>{children}</div>
    </div>
  );
}

function FeedbackThankYou({ reward, email }: FeedbackThankYouProps) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const toast = useRef<Toast>(null);

  if (reward?.status === "ISSUED") {
    const copyCode = async () => {
      try {
        await navigator.clipboard.writeText(reward.code);
        toast.current?.show({
          severity: "success",
          summary: feedbackLanguageData.codeCopied(lang),
          life: 2000,
        });
      } catch {
        // Clipboard unavailable; the code stays visible for manual copy.
      }
    };

    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-xl md:p-8">
        <Toast ref={toast} />
        <CheckIcon />
        <h2 className="text-2xl font-bold text-gray-800">
          {feedbackLanguageData.rewardThanksTitle(lang)}
        </h2>
        <p className="text-sm text-gray-600">
          {feedbackLanguageData.rewardIssuedLead(lang)}
        </p>
        <div className="flex w-full items-center justify-between gap-2.5 rounded-2xl border-2 border-dashed border-primary-color bg-[#EAF3FC] py-3 pl-4 pr-3">
          <span className="break-all font-mono text-lg font-extrabold tracking-wider text-[#1d5fa6]">
            {reward.code}
          </span>
          <button
            type="button"
            onClick={copyCode}
            className="whitespace-nowrap rounded-xl bg-primary-color px-3 py-2 text-sm font-bold text-white transition hover:bg-primary-color/90 active:scale-95"
          >
            {feedbackLanguageData.copyCode(lang)}
          </button>
        </div>
        <div className="flex w-full flex-col gap-2 rounded-2xl border border-gray-200 px-3.5 py-3">
          <DetailRow badge="%">
            {feedbackLanguageData.rewardDetailPlan(lang)}
          </DetailRow>
          <DetailRow badge="1×">
            {feedbackLanguageData.rewardDetailExpiry(
              lang,
              formatRewardDate(reward.expiresAt, lang),
            )}
          </DetailRow>
          {email && (
            <DetailRow badge="@">
              {feedbackLanguageData.rewardDetailEmail(lang, email)}
            </DetailRow>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {feedbackLanguageData.rewardWhereToUse(lang)}
        </p>
      </div>
    );
  }

  if (reward?.status === "ALREADY_ISSUED") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-xl md:p-8">
        <CheckIcon />
        <h2 className="text-2xl font-bold text-gray-800">
          {feedbackLanguageData.rewardThanksTitle(lang)}
        </h2>
        <p className="text-sm text-gray-600">
          {feedbackLanguageData.alreadyReceivedLead(lang)}
        </p>
        <div className="flex w-full flex-col gap-2 rounded-2xl border border-gray-200 px-3.5 py-3">
          <DetailRow badge="%">
            {reward.code && reward.expiresAt
              ? feedbackLanguageData.alreadyReceivedWithCode(
                  lang,
                  reward.code,
                  formatRewardDate(reward.expiresAt, lang),
                )
              : feedbackLanguageData.alreadyReceivedNoCode(lang)}
          </DetailRow>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center justify-center gap-4 rounded-3xl bg-white p-8 text-center shadow-xl">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-5xl text-green-500">
        🎉
      </div>
      <h2 className="text-2xl font-bold text-gray-800">
        {feedbackLanguageData.successTitle(lang)}
      </h2>
      <p className="text-gray-600">
        {feedbackLanguageData.successMessage(lang)}
      </p>
    </div>
  );
}

export default FeedbackThankYou;
