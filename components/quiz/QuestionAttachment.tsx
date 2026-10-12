import dynamic from "next/dynamic";
import React, { useState } from "react";
import { MdAudiotrack, MdPictureAsPdf } from "react-icons/md";
import { quizLanguage } from "../../data/languages";
import { Language, QuizAttachment } from "../../interfaces";
import { formatBytes } from "../../utils/quizAttachment";

const PdfViewerSheet = dynamic(() => import("./PdfViewerSheet"), { ssr: false });

type Props = {
  attachment: QuizAttachment;
  language: Language;
  /** Quiz test mode: no fullscreen / PiP / download controls on media. */
  testMode?: boolean;
  /** Smaller media for side panels. */
  compact?: boolean;
};

/** A question's attachment as students see it; never navigates away from the page. */
export default function QuestionAttachment({ attachment, language, testMode, compact }: Props) {
  const [failed, setFailed] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const meta = `${quizLanguage.kindLabel(language, attachment.kind)}${
    attachment.size > 0 ? ` · ${formatBytes(attachment.size)}` : ""
  }`;

  if (failed) {
    return (
      <p className="rounded-xl bg-error-color/10 px-3 py-2 text-sm text-error-color">
        {quizLanguage.mediaLoadError(language)}
      </p>
    );
  }

  switch (attachment.kind) {
    case "IMAGE":
      return (
        <img
          src={attachment.url}
          alt={quizLanguage.questionImageAlt(language)}
          onError={() => setFailed(true)}
          className={`${compact ? "max-h-32" : "max-h-64"} max-w-full rounded-2xl object-contain`}
        />
      );
    case "AUDIO":
      return (
        <div className="flex w-full max-w-md flex-col gap-2 rounded-2xl border border-gray-100 bg-primary-color/5 p-3">
          <div className="flex items-center gap-2 text-sm text-icon-color">
            <MdAudiotrack className="shrink-0 text-xl text-primary-color" />
            <span className="min-w-0 truncate font-medium">{attachment.name}</span>
          </div>
          <audio
            controls
            preload="metadata"
            controlsList="nodownload"
            src={attachment.url}
            onError={() => setFailed(true)}
            className="w-full"
          />
        </div>
      );
    case "VIDEO":
      return (
        <video
          controls
          playsInline
          preload="metadata"
          src={attachment.url}
          onError={() => setFailed(true)}
          {...(testMode
            ? { controlsList: "nofullscreen nodownload", disablePictureInPicture: true }
            : {})}
          className={`${compact ? "max-h-40" : "max-h-80"} w-full max-w-2xl rounded-2xl bg-black`}
        />
      );
    case "PDF":
      return (
        <>
          <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error-color/10 text-2xl text-error-color">
              <MdPictureAsPdf />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-icon-color">{attachment.name}</span>
              <span className="text-xs text-icon-color/60">{meta}</span>
            </span>
            <button
              type="button"
              onClick={() => setPdfOpen(true)}
              className="rounded-xl bg-primary-color px-4 py-2 text-sm font-medium text-white hover:bg-primary-color-hover"
            >
              {quizLanguage.openPdf(language)}
            </button>
          </div>
          {pdfOpen && (
            <PdfViewerSheet
              url={attachment.url}
              name={attachment.name}
              language={language}
              onClose={() => setPdfOpen(false)}
            />
          )}
        </>
      );
  }
}
