import React from "react";
import { FaLine } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useGetLanguage } from "../../react-query";

type Props = {
  onClose?: () => void;
};

function QrCodeLineConnect({ onClose }: Props) {
  const language = useGetLanguage();

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
