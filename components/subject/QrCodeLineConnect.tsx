import React from "react";
import { FaLine } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useGetLanguage, useGetLineGroups } from "../../react-query";
import { useRouter } from "next/router";
import { lineGroupLanguage } from "../../data/languages";
import {
  lineGroupDisplayName,
  verifiedLineGroups,
} from "../../utils/lineGroup";

type Props = {
  onClose?: () => void;
  subjectId: string;
};

function QrCodeLineConnect({ onClose, subjectId }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const lineGroups = useGetLineGroups({ subjectId });
  const connected = verifiedLineGroups(lineGroups.data);
  const router = useRouter();

  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-white p-8 shadow-xl">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
        >
          <IoClose className="text-xl" />
        </button>
      )}

      {connected.length > 0 && (
        <div className="flex w-full flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-800">
            {lineGroupLanguage.connected(lang)} ({connected.length})
          </h3>
          <ul className="flex max-h-32 flex-col gap-2 overflow-y-auto">
            {connected.map((link) => {
              const name = lineGroupDisplayName(link, lang);
              return (
                <li
                  key={link.id}
                  className="flex min-w-0 items-center gap-2 text-sm text-gray-600"
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full bg-[#00B900]"
                  />
                  <span title={name} className="truncate">
                    {name}
                  </span>
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => {
              router.push(
                `/subject/${subjectId}?menu=SettingSubject#line-groups`,
              );
              if (onClose) onClose();
            }}
            className="w-full rounded-xl bg-blue-500 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
          >
            {lineGroupLanguage.manageInSettings(lang)}
          </button>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#00B900] shadow-md">
          <FaLine className="text-4xl text-white" />
        </div>
        <h2 className="text-center text-2xl font-bold text-gray-800">
          {language.data === "th"
            ? "เชื่อมต่อกลุ่มไลน์"
            : "Connect to Line Group"}
        </h2>
        <p className="text-center text-sm text-gray-500">
          {language.data === "th"
            ? "ทำตามขั้นตอนเพื่อเชื่อมต่อรายวิชาของคุณ"
            : "Follow these steps to connect your subject"}
        </p>
      </div>

      <div className="relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-xl border-2 border-gray-100 bg-white p-2 shadow-sm">
        <img
          src="https://qr-official.line.me/sid/L/879zapgu.png"
          className="h-full w-full object-contain"
          alt="Line QR Code"
        />
      </div>

      <div className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-5">
        <ol className="flex flex-col gap-4 text-sm text-gray-600">
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00B900] text-xs font-bold text-white shadow-sm">
              1
            </span>
            <span className="pt-0.5 leading-snug">
              {language.data === "th"
                ? "สแกนคิวอาร์โค้ดเพื่อเพิ่มเพื่อน"
                : "Scan QR code to add friends"}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00B900] text-xs font-bold text-white shadow-sm">
              2
            </span>
            <span className="pt-0.5 leading-snug">
              {language.data === "th"
                ? "เชิญ Tatuga School เข้ากลุ่มแชท"
                : "Invite Tatuga School to group chat"}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00B900] text-xs font-bold text-white shadow-sm">
              3
            </span>
            <span className="pt-0.5 leading-snug">
              {language.data === "th"
                ? "เฉพาะ Premium Plan และ Enterprise plan เท่านั้นที่สามารถใช้งานได้"
                : "Only Premium Plan and Enterprise plan will work"}
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default QrCodeLineConnect;
