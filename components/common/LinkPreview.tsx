import React, { useState } from "react";
import { MdOutlineLink } from "react-icons/md";

// Compact "source" card: favicon-sized image (falls back to a link icon),
// hostname and title. Renders nothing when there is no usable link, so the
// caller never shows an empty or broken card.
const LinkPreview = ({
  title,
  description,
  image,
  url,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  let hostname: string | null = null;
  try {
    if (url) hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    hostname = null;
  }
  if (!url || !hostname) return null;

  const showImage = Boolean(image) && !imageFailed;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={description || title || url}
      className="flex w-full max-w-xl items-center gap-3 rounded-2xl border bg-white p-2 pr-3 transition hover:border-primary-color/60"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-gray-50 text-xl text-gray-400">
        {showImage ? (
          <img
            src={image}
            alt=""
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <MdOutlineLink />
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-xs text-gray-400">{hostname}</span>
        <span className="line-clamp-2 text-sm font-medium leading-snug text-gray-900">
          {title || url}
        </span>
      </span>
    </a>
  );
};

export default LinkPreview;
