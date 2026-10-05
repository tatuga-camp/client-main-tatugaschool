import Image from "next/image";
import React, { useState } from "react";
import { BsChatDots } from "react-icons/bs";
import { FaUsers, FaUserTie } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import { MdComputer } from "react-icons/md";
import { RiLightbulbLine, RiPaintBrushLine } from "react-icons/ri";
import { defaultBlurHash } from "../../data";
import { careerSectors } from "../../data/career";
import { classroomUiLanguage } from "../../data/languages";
import { useGetCareerSuggestion, useGetLanguage } from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import {
  barPercent,
  EXPECTED_MARKER_PERCENT,
  localizeSector,
  skillBand,
  SkillBand,
  summarizeSkills,
} from "../../utils/careerReport";

// Icon and color per skill family; unknown skills get the neutral style.
const getSkillStyles = (skillTitle: string) => {
  const title = skillTitle.toLowerCase();
  if (title.includes("leadership"))
    return { icon: <FaUserTie />, tint: "text-orange-500 bg-orange-100" };
  if (title.includes("communication"))
    return { icon: <BsChatDots />, tint: "text-blue-500 bg-blue-100" };
  if (title.includes("critical thinking"))
    return { icon: <RiLightbulbLine />, tint: "text-purple-500 bg-purple-100" };
  if (title.includes("digital literacy"))
    return { icon: <MdComputer />, tint: "text-red-500 bg-red-100" };
  if (title.includes("creativity"))
    return { icon: <RiPaintBrushLine />, tint: "text-yellow-600 bg-yellow-100" };
  if (title.includes("collaboration"))
    return { icon: <FaUsers />, tint: "text-green-600 bg-green-100" };
  return { icon: <RiLightbulbLine />, tint: "text-icon-color/70 bg-background-color" };
};

const bandStyles: Record<SkillBand, { bar: string; text: string }> = {
  above: { bar: "bg-success-color", text: "text-success-color" },
  close: { bar: "bg-primary-color", text: "text-primary-color" },
  below: { bar: "bg-icon-color/40", text: "text-icon-color/60" },
};

const VISIBLE_CAREERS = 3;

type Props = {
  studentId: string;
  studentName: string;
  onClose: () => void;
};

function StudentCareerSuggest({ studentId, studentName, onClose }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const careers = useGetCareerSuggestion({ studentId });
  const [showAll, setShowAll] = useState(false);

  const bandLabel = (band: SkillBand) =>
    band === "above"
      ? classroomUiLanguage.bandAbove(lang)
      : band === "close"
        ? classroomUiLanguage.bandClose(lang)
        : classroomUiLanguage.bandBelow(lang);

  const backLink = (
    <button
      type="button"
      onClick={onClose}
      className="flex h-10 items-center gap-2 self-start rounded-xl px-2 text-sm font-semibold text-primary-color transition-colors hover:bg-primary-color/10"
    >
      <FiArrowLeft aria-hidden />
      {classroomUiLanguage.backTo(lang, studentName)}
    </button>
  );

  const shell = (children: React.ReactNode) => (
    <div className="flex min-h-0 grow flex-col gap-5 overflow-auto px-4 pb-10 sm:px-6">
      {backLink}
      {children}
    </div>
  );

  const message = (title: string, body?: string, action?: React.ReactNode) =>
    shell(
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-background-color px-6 py-12 text-center">
        <p className="font-semibold text-icon-color">{title}</p>
        {body && <p className="max-w-sm text-sm text-icon-color/70">{body}</p>}
        {action}
      </div>,
    );

  if (careers.isLoading) {
    return shell(
      <div className="flex animate-pulse flex-col gap-4">
        <div className="h-28 rounded-2xl bg-background-color" />
        <div className="h-36 rounded-2xl bg-background-color" />
        <div className="h-40 rounded-2xl bg-background-color" />
      </div>,
    );
  }

  if (careers.error?.message === "Data is not enough to give a suggestion") {
    return message(
      classroomUiLanguage.notEnoughData(lang, studentName),
      classroomUiLanguage.notEnoughDataBody(lang),
    );
  }

  if (careers.error) {
    return message(
      classroomUiLanguage.careerLoadError(lang),
      undefined,
      <button
        type="button"
        onClick={() => careers.refetch()}
        className="mt-2 h-10 rounded-xl bg-primary-color px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-color-hover"
      >
        {classroomUiLanguage.tryAgain(lang)}
      </button>,
    );
  }

  const allCareers = careers.data?.careers ?? [];
  if (allCareers.length === 0) {
    return message(classroomUiLanguage.noCareers(lang, studentName));
  }

  const { strongest, toGrow } = summarizeSkills(careers.data?.student.skills ?? []);
  const sectorFor = (title: string) => {
    const sector = careerSectors.find((item) => item.title === title);
    return sector ? localizeSector(sector, lang) : null;
  };
  const topSector = sectorFor(allCareers[0].title);
  const shown = showAll ? allCareers : allCareers.slice(0, VISIBLE_CAREERS);
  const hiddenCount = allCareers.length - VISIBLE_CAREERS;

  const skillChip = (skill: { id: string; title: string }) => {
    const styles = getSkillStyles(skill.title);
    return (
      <li
        key={skill.id}
        className="flex items-center gap-2 text-sm font-medium text-icon-color"
      >
        <span
          aria-hidden
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${styles.tint}`}
        >
          {styles.icon}
        </span>
        {skill.title}
      </li>
    );
  };

  return shell(
    <>
      <section className="rounded-2xl bg-background-color p-4 sm:p-5">
        <h2 className="text-lg font-bold leading-snug text-icon-color">
          {classroomUiLanguage.careerHeading(lang, studentName)}
        </h2>
        <p className="mt-1 text-sm text-icon-color/60">
          {classroomUiLanguage.careerSource(lang)}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {strongest.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-success-color">
                {classroomUiLanguage.strongestSkills(lang)}
              </h3>
              <ul className="flex flex-col gap-2">{strongest.map(skillChip)}</ul>
            </div>
          )}
          {toGrow.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-icon-color/70">
                {classroomUiLanguage.skillsToGrow(lang)}
              </h3>
              <ul className="flex flex-col gap-2">{toGrow.map(skillChip)}</ul>
            </div>
          )}
        </div>
      </section>

      {topSector && (
        <section className="overflow-hidden rounded-2xl ring-1 ring-icon-color/10">
          <div className="relative h-36 w-full bg-background-color">
            <Image
              src={topSector.picture}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                topSector.blurHash || defaultBlurHash,
              )}
              className="object-cover"
            />
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-sm font-medium text-icon-color/60">
              {classroomUiLanguage.topMatch(lang)}
            </p>
            <h3 className="mt-0.5 text-lg font-bold text-icon-color">
              {topSector.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-icon-color/70">
              {topSector.description}
            </p>
            <p className="mt-3 text-sm font-medium text-icon-color/60">
              {classroomUiLanguage.exampleJobs(lang)}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {topSector.careers.map((career) => (
                <li
                  key={career.title}
                  title={career.description}
                  className="rounded-full bg-primary-color/10 px-3 py-1 text-xs font-medium text-primary-color"
                >
                  {career.title}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-bold text-icon-color">
            {classroomUiLanguage.rankedCareers(lang)}
          </h3>
          <p className="flex items-center gap-1.5 text-xs text-icon-color/60">
            <span aria-hidden className="h-3 w-0.5 rounded bg-icon-color" />
            {classroomUiLanguage.expectedLevel(lang)}
          </p>
        </div>
        <ol className="flex flex-col gap-3">
          {shown.map((career, index) => {
            const sector = sectorFor(career.title);
            return (
              <li
                key={career.id ?? career.title}
                className="rounded-2xl bg-white p-4 ring-1 ring-icon-color/10"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-color/10 text-sm font-bold text-primary-color">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-semibold leading-snug text-icon-color">
                      {sector?.title ?? career.title}
                    </h4>
                    {sector && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-icon-color/60">
                        {sector.description}
                      </p>
                    )}
                  </div>
                </div>
                <ul className="mt-4 flex flex-col gap-3">
                  {career.skills.map((skill) => {
                    const band = skillBand(skill.matchPoint);
                    return (
                      <li key={skill.id}>
                        <div className="flex flex-wrap items-center justify-between gap-x-3 text-sm">
                          <span className="font-medium text-icon-color">
                            {skill.title}
                          </span>
                          <span className={`text-xs font-semibold ${bandStyles[band].text}`}>
                            {bandLabel(band)}
                          </span>
                        </div>
                        <div className="relative mt-1.5 h-2 rounded-full bg-background-color">
                          <div
                            className={`h-2 rounded-full ${bandStyles[band].bar}`}
                            style={{ width: `${barPercent(skill.matchPoint)}%` }}
                          />
                          <span
                            aria-hidden
                            className="absolute -top-1 h-4 w-0.5 rounded bg-icon-color"
                            style={{ left: `${EXPECTED_MARKER_PERCENT}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            aria-expanded={showAll}
            className="mt-3 h-10 w-full rounded-xl border border-icon-color/15 text-sm font-semibold text-icon-color transition-colors hover:bg-background-color"
          >
            {showAll
              ? classroomUiLanguage.showLess(lang)
              : classroomUiLanguage.showMore(lang, hiddenCount)}
          </button>
        )}
      </section>
    </>,
  );
}

export default StudentCareerSuggest;
