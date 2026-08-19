import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MdOutlineTimer } from "react-icons/md";
import { RenewDataLanguage } from "../../data/languages/renew";
import { useGetLanguage, useGetSchool, useGetUser } from "../../react-query";

const DAY_MS = 86_400_000;

function todayKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function dismissKey(schoolId: string): string {
  return `subscription-bar-dismissed:${schoolId}:${todayKey()}`;
}

function SubscriptionExpireBar({ schoolId }: { schoolId: string }) {
  const school = useGetSchool({ schoolId });
  const user = useGetUser();
  const language = useGetLanguage();
  const router = useRouter();
  const lang = language.data ?? "en";
  // Start dismissed so SSR and the first client render agree; localStorage
  // is only readable after mount.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(dismissKey(schoolId)) !== null);
  }, [schoolId]);

  if (!school.data || school.data.plan === "FREE" || dismissed) {
    return null;
  }
  const expireAt = school.data.stripe_subscription_expireAt;
  if (!expireAt) return null;

  const daysLeft = Math.ceil(
    (new Date(expireAt).getTime() - Date.now()) / DAY_MS,
  );
  console.log("daysLeft", daysLeft);
  if (daysLeft <= 0 || daysLeft > 10) return null;

  const isBillingManager =
    !!user.data && user.data.id === school.data.billingManagerId;

  return (
    <div className="fixed bottom-0 z-10 flex w-full items-center justify-center gap-3 border-b border-warning-color bg-warning-color px-4 py-2 font-Anuphan text-sm text-icon-color">
      <MdOutlineTimer className="shrink-0 text-warning-color" />
      <span>
        {RenewDataLanguage.barMessage(lang, school.data.plan, daysLeft)}
      </span>
      {isBillingManager ? (
        <button
          onClick={() => router.push(`/school/${schoolId}?menu=Subscription`)}
          className="main-button shrink-0 px-3 py-1 text-xs"
        >
          {RenewDataLanguage.renewEarlyButton(lang)}
        </button>
      ) : (
        <span className="text-xs text-icon-color/70">
          {RenewDataLanguage.barContactManager(lang)}
        </span>
      )}
      <button
        aria-label="Dismiss"
        onClick={() => {
          localStorage.setItem(dismissKey(schoolId), "1");
          setDismissed(true);
        }}
        className="ml-2 shrink-0 text-icon-color/60 hover:text-icon-color"
      >
        <IoMdClose />
      </button>
    </div>
  );
}

export default SubscriptionExpireBar;
