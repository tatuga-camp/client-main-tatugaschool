import { Language, School } from "@/interfaces";
import { filesize } from "filesize";
import Image from "next/image";
import Link from "next/link";
import { memo, useMemo, useState } from "react";
import {
  LuArrowRight,
  LuCalendarDays,
  LuHardDrive,
  LuMapPin,
  LuPhone,
  LuRefreshCw,
  LuStar,
} from "react-icons/lu";
import { defaultBlurHash } from "../../data";
import { homepageDataLanguage as t } from "../../data/languages";
import { decodeBlurhashToCanvas } from "../../utils";
import { schoolLocation, storageUsage } from "../../utils/schoolList";
import PlanBadge from "../common/PlanBadge";

type Props = {
  school: School;
  language: Language;
  isDefault: boolean;
  savingDefault: boolean;
  onSetDefault: (schoolId: string) => void;
};

const LOGO_PX = 72;

function SchoolCard({
  school,
  language,
  isDefault,
  savingDefault,
  onSetDefault,
}: Props) {
  const [logoFailed, setLogoFailed] = useState(false);
  const locale = language === "th" ? "th-TH" : "en-GB";
  const blurDataURL = useMemo(
    () => decodeBlurhashToCanvas(school.blurHash || defaultBlurHash),
    [school.blurHash],
  );
  const location = schoolLocation(school);
  const usage = storageUsage(school);
  const formatDate = (value: Date | string) =>
    new Date(value).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const expireAt = school.stripe_subscription_expireAt
    ? new Date(school.stripe_subscription_expireAt)
    : null;
  const showRenewal =
    school.plan !== "FREE" && expireAt && !Number.isNaN(expireAt.getTime());
  const expired = showRenewal && expireAt!.getTime() < Date.now();
  const meterColor =
    usage.percent >= 90
      ? "bg-error-color"
      : usage.percent >= 75
        ? "bg-warning-color"
        : "bg-primary-color";
  const hasLogo = !!school.logo && !logoFailed;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isDefault
          ? "border-primary-color/40 ring-2 ring-primary-color/30"
          : "border-gray-200 hover:border-primary-color/30"
      }`}
    >
      {/* Banner: the school's own blurhash as a soft backdrop, else brand gradient. */}
      <div
        className="gradient-bg relative h-24 shrink-0 bg-cover bg-center"
        style={
          school.blurHash && blurDataURL
            ? { backgroundImage: `url(${blurDataURL})` }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/25" />
        <button
          type="button"
          onClick={() => !isDefault && onSetDefault(school.id)}
          disabled={savingDefault}
          aria-pressed={isDefault}
          aria-label={
            isDefault
              ? t.defaultBadge(language)
              : t.setDefaultAria(language, school.title)
          }
          title={isDefault ? t.defaultBadge(language) : t.setDefault(language)}
          className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-color focus-visible:ring-offset-2 disabled:cursor-wait ${
            isDefault
              ? "cursor-default bg-warning-color text-icon-color"
              : "bg-white/90 text-icon-color hover:bg-white active:scale-95"
          }`}
        >
          <LuStar
            aria-hidden
            className={`h-3.5 w-3.5 ${isDefault ? "fill-icon-color" : ""}`}
          />
          {isDefault ? t.defaultBadge(language) : t.setDefault(language)}
        </button>
      </div>

      {/* Logo tile: fixed square, contain, so any aspect ratio fits uncropped. */}
      <div className="pointer-events-none relative z-[1] -mt-9 px-5">
        <div
          className="relative overflow-hidden rounded-2xl bg-white shadow-md ring-4 ring-white"
          style={{ width: LOGO_PX, height: LOGO_PX }}
        >
          {hasLogo ? (
            <Image
              src={school.logo}
              alt={school.title}
              fill
              sizes={`${LOGO_PX}px`}
              placeholder={blurDataURL ? "blur" : "empty"}
              blurDataURL={blurDataURL || undefined}
              className="object-contain p-1"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span
              aria-hidden
              className="flex h-full w-full items-center justify-center bg-primary-color/10 text-2xl font-bold text-primary-color"
            >
              {school.title.trim().charAt(0).toUpperCase() || "?"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-lg font-semibold leading-snug text-gray-900">
            {/* Stretched link: the whole card opens the school. */}
            <Link
              href={`/school/${school.id}`}
              title={school.title}
              className="line-clamp-2 break-words focus:outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-primary-color"
            >
              {school.title}
            </Link>
          </h3>
          <div className="shrink-0 pt-0.5">
            <PlanBadge plan={school.plan} />
          </div>
        </div>

        <p
          className={`mt-1 line-clamp-2 min-h-[2.5rem] text-sm ${
            school.description?.trim() ? "text-gray-600" : "italic text-gray-400"
          }`}
        >
          {school.description?.trim() || t.noDescription(language)}
        </p>

        <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
          {location && (
            <li className="flex items-center gap-2">
              <LuMapPin aria-hidden className="h-4 w-4 shrink-0 text-icon-color/60" />
              <span className="truncate">{location}</span>
            </li>
          )}
          {school.phoneNumber?.trim() && (
            <li className="flex items-center gap-2">
              <LuPhone aria-hidden className="h-4 w-4 shrink-0 text-icon-color/60" />
              <span className="truncate">{school.phoneNumber}</span>
            </li>
          )}
          <li className="flex items-center gap-2">
            <LuCalendarDays aria-hidden className="h-4 w-4 shrink-0 text-icon-color/60" />
            <span className="truncate">
              {t.createdOn(language, formatDate(school.createAt))}
            </span>
          </li>
          {showRenewal && (
            <li
              className={`flex items-center gap-2 ${expired ? "font-medium text-error-color" : ""}`}
            >
              <LuRefreshCw
                aria-hidden
                className={`h-4 w-4 shrink-0 ${expired ? "" : "text-icon-color/60"}`}
              />
              <span className="truncate">
                {expired
                  ? t.expiredOn(language, formatDate(expireAt!))
                  : t.renewsOn(language, formatDate(expireAt!))}
              </span>
            </li>
          )}
        </ul>

        <div className="mt-auto pt-4">
          <div className="rounded-xl bg-background-color px-3 py-2.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <LuHardDrive aria-hidden className="h-3.5 w-3.5 text-icon-color/60" />
                {t.storage(language)}
              </span>
              <span className="tabular-nums text-gray-600">
                {filesize(usage.used, { standard: "jedec" })} /{" "}
                {usage.limit
                  ? filesize(usage.limit, { standard: "jedec" })
                  : t.unlimited(language)}
              </span>
            </div>
            {usage.limit && (
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200"
                role="progressbar"
                aria-label={t.storage(language)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={usage.percent}
              >
                <div
                  className={`h-full rounded-full ${meterColor}`}
                  style={{ width: `${Math.max(usage.percent, 2)}%` }}
                />
              </div>
            )}
          </div>

          <span
            aria-hidden
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary-color px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-primary-color-hover"
          >
            {t.openSchool(language)}
            <LuArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

export default memo(SchoolCard);
