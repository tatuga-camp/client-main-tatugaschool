import Image from "next/image";
import { Language } from "../../interfaces";
import { updatesLanguageData } from "../../data/languages";
import { urlForImage } from "../../sanity/lib/image";
import { Announcement, AnnouncementType } from "../../services/announcement";
import PortableTextBody from "./PortableTextBody";

const typeStyles: Record<
  AnnouncementType,
  { chip: string; label: (language: Language) => string }
> = {
  feature: {
    chip: "bg-info-color/10 text-info-color",
    label: updatesLanguageData.filterFeature,
  },
  fix: {
    chip: "bg-warning-color/20 text-yellow-700",
    label: updatesLanguageData.filterFix,
  },
  news: {
    chip: "bg-success-color/10 text-success-color",
    label: updatesLanguageData.filterNews,
  },
  announcement: {
    chip: "bg-primary-color/10 text-primary-color",
    label: updatesLanguageData.filterAnnouncement,
  },
};

function AnnouncementCard({
  announcement,
  language,
}: {
  announcement: Announcement;
  language: Language;
}) {
  const title = language === "th" ? announcement.titleTh : announcement.titleEn;
  const body = language === "th" ? announcement.bodyTh : announcement.bodyEn;
  const style = typeStyles[announcement.type];
  const formattedDate = new Date(announcement.publishedAt).toLocaleDateString(
    language === "th" ? "th-TH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      {announcement.coverImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={urlForImage(announcement.coverImage)
              .width(1200)
              .height(675)
              .fit("crop")
              .auto("format")
              .url()}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${style.chip}`}
        >
          {style.label(language)}
        </span>
        <span className="text-xs text-gray-400">{formattedDate}</span>
      </div>
      <h2 className="text-lg font-bold text-gray-800 md:text-xl">{title}</h2>
      <PortableTextBody value={body} />
    </article>
  );
}

export default AnnouncementCard;
