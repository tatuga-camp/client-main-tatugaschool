import React, { useEffect, useState } from "react";
import * as qrcode from "qrcode";
import {
  MdCheck,
  MdClose,
  MdContentCopy,
  MdDownload,
  MdQrCode2,
} from "react-icons/md";
import { useGetLanguage } from "../../react-query";

const strings = {
  en: {
    title: "QR Code Generator",
    subtitle: "Paste a link or type any text",
    placeholder: "https://example.com",
    helper: "Your QR code will open this link or show this text.",
    tooLong: "This text is too long for a QR code. Try something shorter.",
    empty: "Your QR code will appear here",
    copy: "Copy image",
    copied: "Copied",
    copyFailed: "Copy failed",
    download: "Download image",
  },
  th: {
    title: "สร้าง QR Code",
    subtitle: "วางลิงก์หรือพิมพ์ข้อความใดก็ได้",
    placeholder: "https://example.com",
    helper: "QR Code นี้จะเปิดลิงก์หรือแสดงข้อความที่คุณพิมพ์",
    tooLong: "ข้อความยาวเกินไปสำหรับ QR Code ลองให้สั้นลง",
    empty: "QR Code จะแสดงที่นี่",
    copy: "คัดลอกรูป",
    copied: "คัดลอกแล้ว",
    copyFailed: "คัดลอกไม่สำเร็จ",
    download: "ดาวน์โหลดรูป",
  },
};

type GeneratedQR = { dataUrl: string; blob: Blob };

type Props = {
  onClose: () => void;
};

function QRCodeGenerator({ onClose }: Props) {
  const language = useGetLanguage();
  const t = strings[language.data ?? "en"];
  const [text, setText] = useState("");
  const [qr, setQr] = useState<GeneratedQR | null>(null);
  const [tooLong, setTooLong] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [canCopy] = useState(
    () =>
      typeof window !== "undefined" &&
      "ClipboardItem" in window &&
      !!navigator.clipboard?.write,
  );

  useEffect(() => {
    const value = text.trim();
    if (!value) {
      setQr(null);
      setTooLong(false);
      return;
    }
    let cancelled = false;
    const canvas = document.createElement("canvas");
    qrcode
      .toCanvas(canvas, value, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: "M",
      })
      .then(
        () =>
          new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png"),
          ),
      )
      .then((blob) => {
        if (cancelled || !blob) return;
        setQr({ dataUrl: canvas.toDataURL("image/png"), blob });
        setTooLong(false);
      })
      .catch(() => {
        if (cancelled) return;
        setQr(null);
        setTooLong(true);
      });
    return () => {
      cancelled = true;
    };
  }, [text]);

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = setTimeout(() => setCopyState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [copyState]);

  // Safari only allows clipboard writes started synchronously in the click, so no awaits before write().
  const handleCopy = () => {
    if (!qr) return;
    navigator.clipboard
      .write([new ClipboardItem({ "image/png": qr.blob })])
      .then(() => setCopyState("copied"))
      .catch(() => setCopyState("failed"));
  };

  const handleDownload = () => {
    if (!qr) return;
    const link = document.createElement("a");
    link.href = qr.dataUrl;
    link.download = "qr-code.png";
    link.click();
  };

  return (
    <div className="flex w-[calc(100vw-2rem)] max-w-md flex-col rounded-2xl border-2 border-black bg-white">
      <header className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div className="flex flex-col">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <MdQrCode2 className="text-blue-500" />
            {t.title}
          </h2>
          <p className="text-sm text-gray-500">{t.subtitle}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-full bg-gray-200 p-2 text-gray-600 transition-colors hover:bg-red-500 hover:text-white"
        >
          <MdClose size={20} />
        </button>
      </header>

      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="flex flex-col gap-1.5">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-color"
          />
          <p
            className={`text-xs ${tooLong ? "text-red-500" : "text-gray-500"}`}
          >
            {tooLong ? t.tooLong : t.helper}
          </p>
        </div>

        <div className="mx-auto flex aspect-square w-full max-w-[16rem] items-center justify-center rounded-2xl bg-gray-50 p-4">
          {qr ? (
            <img
              src={qr.dataUrl}
              alt="QR code"
              className="h-full w-full rounded-lg bg-white"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-400">
              <MdQrCode2 className="text-6xl" />
              <span className="px-4 text-center text-xs">{t.empty}</span>
            </div>
          )}
        </div>
      </div>

      <footer className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
        {canCopy && (
          <button
            onClick={handleCopy}
            disabled={!qr}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copyState === "copied" ? (
              <MdCheck className="text-green-600" />
            ) : (
              <MdContentCopy />
            )}
            {copyState === "copied"
              ? t.copied
              : copyState === "failed"
                ? t.copyFailed
                : t.copy}
          </button>
        )}
        <button
          onClick={handleDownload}
          disabled={!qr}
          className="flex items-center gap-2 rounded-xl bg-primary-color px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MdDownload />
          {t.download}
        </button>
      </footer>
    </div>
  );
}

export default QRCodeGenerator;
