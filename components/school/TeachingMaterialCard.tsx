import { useState } from "react";
import { MdOutlineImageNotSupported } from "react-icons/md";
import { SiCanva } from "react-icons/si";
import { TeachingMaterial } from "../../interfaces";
import { teachingMaterialDataLanguage as L } from "../../data/languages/teaching-material";

type Props = {
  teachingMaterial: TeachingMaterial;
  language: "en" | "th";
  onClick: () => void;
};

// The AI search returns a 0..1 similarity score; older rows and the
// "recent" listing have none. Only show the badge when it is a real number.
function formatMatch(score: unknown): string | null {
  if (typeof score !== "number" || !Number.isFinite(score)) return null;
  const percent = Math.round(score * 100);
  if (percent < 0 || percent > 100) return null;
  return `${percent}%`;
}

function TeachingMaterialCard({ teachingMaterial, onClick, language }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const match = formatMatch(teachingMaterial.score);
  const title =
    (language === "th" ? teachingMaterial.titleTH : teachingMaterial.title) ||
    teachingMaterial.title ||
    teachingMaterial.titleTH;
  const showImage = Boolean(teachingMaterial.thumbnail) && !imageFailed;
  const createdAt = new Date(teachingMaterial.createAt).toLocaleDateString(
    language === "th" ? "th-TH" : "en-GB",
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={() => onClick()}
        className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-white text-left font-Anuphan transition hover:border-primary-color/60 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-color/40"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b bg-gray-50">
          {showImage ? (
            <img
              src={teachingMaterial.thumbnail}
              alt=""
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400">
              <MdOutlineImageNotSupported className="text-3xl" />
              <span className="text-xs">{L.noThumbnail(language)}</span>
            </div>
          )}
          {teachingMaterial.canvaURL && (
            <span
              title="Canva"
              className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border bg-white text-base text-icon-color"
            >
              <SiCanva />
            </span>
          )}
          {match && (
            <span className="absolute right-2 top-2 rounded-full border border-primary-color/20 bg-white px-2 py-0.5 text-xs font-medium text-primary-color">
              {L.match(language)} {match}
            </span>
          )}
        </div>
        <div className="flex grow flex-col gap-2 p-3">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-gray-900 md:text-base">
            {title}
          </h3>
          {teachingMaterial.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1">
              {teachingMaterial.tags.slice(0, 4).map((tag, index) => (
                <li
                  key={index}
                  className="max-w-full truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  {tag}
                </li>
              ))}
              {teachingMaterial.tags.length > 4 && (
                <li className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  +{teachingMaterial.tags.length - 4}
                </li>
              )}
            </ul>
          )}
          <p className="mt-auto pt-1 text-xs text-gray-400">
            {L.createdAt(language)} {createdAt}
          </p>
        </div>
      </button>
    </li>
  );
}

export default TeachingMaterialCard;
