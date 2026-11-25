import React, { useEffect, useRef, useState } from "react";
import { FaLine, FaSpinner } from "react-icons/fa";
import { IoAdd } from "react-icons/io5";
import Swal from "sweetalert2";
import { lineGroupLanguage } from "../../data/languages";
import {
  ErrorMessages,
  Language,
  LineGroupOnSubject,
  LineGroupSwitch,
} from "../../interfaces";
import {
  useDisconnectLineGroup,
  useGetLanguage,
  useGetLineGroups,
  useUpdateLineGroup,
  useVerifyLineToken,
} from "../../react-query";
import { lineGroupDisplayName } from "../../utils/lineGroup";
import Switch from "../common/Switch";
import PopupLayout from "../layout/PopupLayout";
import QrCodeLineConnect from "./QrCodeLineConnect";

const SWITCHES: LineGroupSwitch[] = [
  "allowAssignment",
  "allowMorningSummary",
  "allowAnnouncement",
  "allowAi",
];

function showError(error: unknown) {
  console.log(error);
  const result = error as ErrorMessages;
  Swal.fire({
    title: result?.error ? result.error : "Something Went Wrong",
    text: result?.message?.toString(),
    icon: "error",
  });
}

type CardProps = {
  link: LineGroupOnSubject;
  language: Language;
  // True on an archived subject: nothing may be switched on or connected, but
  // removing a connection (Disconnect, Cancel) is always allowed.
  disabled: boolean;
};

function VerifiedCard({ link, language, disabled }: CardProps) {
  const updateLineGroup = useUpdateLineGroup();
  const disconnectLineGroup = useDisconnectLineGroup();
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false);
  // The switch the teacher just flipped, shown before the server answers.
  // Cleared when the request settles, so a failure falls back to the saved value.
  const [optimistic, setOptimistic] = useState<
    Partial<Record<LineGroupSwitch, boolean>>
  >({});
  const name = lineGroupDisplayName(link, language);

  const handleSwitch = async (field: LineGroupSwitch, value: boolean) => {
    if (disabled) return;
    setOptimistic({ [field]: value });
    try {
      await updateLineGroup.mutateAsync({
        id: link.id,
        body: { [field]: value },
      });
    } catch (error) {
      showError(error);
    } finally {
      setOptimistic({});
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectLineGroup.mutateAsync({ id: link.id });
    } catch (error) {
      showError(error);
      setIsConfirmingDisconnect(false);
    }
  };

  return (
    <li className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#00B900]"
          />
          <span title={name} className="truncate text-base font-medium">
            {name}
          </span>
        </div>
        {isConfirmingDisconnect ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-red-500">
              {lineGroupLanguage.disconnectConfirm(language)}
            </span>
            <button
              type="button"
              onClick={() => setIsConfirmingDisconnect(false)}
              disabled={disconnectLineGroup.isPending}
              className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              {lineGroupLanguage.cancel(language)}
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={disconnectLineGroup.isPending}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              {disconnectLineGroup.isPending && (
                <FaSpinner className="animate-spin" />
              )}
              {lineGroupLanguage.confirm(language)}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingDisconnect(true)}
            className="shrink-0 rounded-xl border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
          >
            {lineGroupLanguage.disconnect(language)}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        {SWITCHES.map((field) => (
          <label
            key={field}
            className="flex items-center justify-between gap-3 py-1"
          >
            <span className="min-w-0 flex-1 text-sm text-black">
              {lineGroupLanguage[field](language)}
            </span>
            <Switch
              checked={optimistic[field] ?? link[field]}
              disabled={disabled || updateLineGroup.isPending}
              setChecked={(value) => handleSwitch(field, value)}
            />
          </label>
        ))}
      </div>
    </li>
  );
}

function PendingCard({ link, language, disabled }: CardProps) {
  const verifyLineToken = useVerifyLineToken();
  const name = lineGroupDisplayName(link, language);

  const handleVerify = async (confirm: boolean) => {
    if (!link.verifyToken) return;
    if (confirm && disabled) return;
    try {
      await verifyLineToken.mutateAsync({
        body: { token: link.verifyToken, confirm, subjectId: link.subjectId },
      });
    } catch (error) {
      showError(error);
    }
  };

  const busy = verifyLineToken.isPending || !link.verifyToken;
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/60 p-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400"
        />
        <div className="flex min-w-0 flex-col">
          <span title={name} className="truncate text-base font-medium">
            {name}
          </span>
          <span className="text-xs text-amber-700">
            {lineGroupLanguage.waiting(language)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleVerify(true)}
          disabled={busy || disabled}
          className="flex items-center gap-2 rounded-xl bg-[#00B900] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#009900] disabled:opacity-50"
        >
          {verifyLineToken.isPending && <FaSpinner className="animate-spin" />}
          {lineGroupLanguage.confirm(language)}
        </button>
        <button
          type="button"
          onClick={() => handleVerify(false)}
          disabled={busy}
          className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
        >
          {lineGroupLanguage.cancel(language)}
        </button>
      </div>
    </li>
  );
}

type Props = {
  subjectId: string;
  // True when the subject is archived (same source as SubjectPermission).
  disabled?: boolean;
};

function LineGroupSettings({ subjectId, disabled = false }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [triggerConnect, setTriggerConnect] = useState(false);
  const lineGroups = useGetLineGroups(
    { subjectId },
    { refetchInterval: triggerConnect ? 15_000 : false },
  );
  const links = lineGroups.data ?? [];

  // Once the code typed in LINE shows up as a pending link, the QR popup has
  // done its job: close it so the confirm step is not hidden behind it.
  const pendingCount = links.filter((link) => !link.isVerify).length;
  const previousPendingCount = useRef(pendingCount);
  useEffect(() => {
    if (pendingCount > previousPendingCount.current) {
      setTriggerConnect(false);
    }
    previousPendingCount.current = pendingCount;
  }, [pendingCount]);

  const connectButton = (
    <button
      type="button"
      onClick={() => setTriggerConnect(true)}
      disabled={disabled}
      className="flex shrink-0 items-center justify-center gap-1 rounded-xl bg-[#00B900] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#009900] active:scale-95 disabled:opacity-50 disabled:hover:bg-[#00B900] disabled:active:scale-100"
    >
      <IoAdd className="text-lg" />
      {lineGroupLanguage.connectAnother(lang)}
    </button>
  );

  return (
    <div className="mt-5 flex flex-col gap-5 rounded-2xl border bg-white p-4">
      {triggerConnect && !disabled && (
        <PopupLayout onClose={() => setTriggerConnect(false)}>
          <QrCodeLineConnect
            subjectId={subjectId}
            onClose={() => setTriggerConnect(false)}
          />
        </PopupLayout>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b py-3">
        <h2 className="flex items-center gap-2 text-lg font-medium">
          <FaLine className="text-2xl text-[#00B900]" />
          {lineGroupLanguage.title(lang)}
        </h2>
        {links.length > 0 && connectButton}
      </div>

      {lineGroups.isLoading ? (
        <ul aria-busy className="divide-y rounded-2xl border">
          {[0, 1].map((i) => (
            <li key={i} className="flex animate-pulse flex-col gap-3 p-4">
              <div className="h-5 w-40 rounded-xl bg-gray-100" />
              <div className="h-7 w-full rounded-xl bg-gray-100" />
            </li>
          ))}
        </ul>
      ) : lineGroups.isError ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-red-500">
            {lineGroupLanguage.loadError(lang)}
          </p>
          <button
            type="button"
            onClick={() => lineGroups.refetch()}
            disabled={lineGroups.isFetching}
            className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            {lineGroupLanguage.retry(lang)}
          </button>
        </div>
      ) : links.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-base font-medium">
            {lineGroupLanguage.empty(lang)}
          </p>
          <p className="max-w-md text-sm text-gray-500">
            {lineGroupLanguage.emptyDescription(lang)}
          </p>
          {connectButton}
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl border">
          {links.map((link) =>
            link.isVerify ? (
              <VerifiedCard
                key={link.id}
                link={link}
                language={lang}
                disabled={disabled}
              />
            ) : (
              <PendingCard
                key={link.id}
                link={link}
                language={lang}
                disabled={disabled}
              />
            ),
          )}
        </ul>
      )}
    </div>
  );
}

export default LineGroupSettings;
