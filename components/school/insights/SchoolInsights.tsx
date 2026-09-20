import React, { useEffect, useState } from "react";
import { TbAlertCircle } from "react-icons/tb";
import { EducationYear } from "@/interfaces";
import { useGetSchoolAnalytics } from "../../../react-query/analytics";
import { useGetLanguage } from "../../../react-query";
import { getDefaultSubjectFilter } from "../../../utils/localstorage";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import InputEducationYear from "../../common/InputEducationYear";
import LoadingBar from "../../common/LoadingBar";
import InsightSummaryCards from "./InsightSummaryCards";
import AtRiskTable from "./AtRiskTable";
import ScoreDistributionBar from "./ScoreDistributionBar";
import ClassLeaderboard from "./ClassLeaderboard";
import SubjectLeaderboard from "./SubjectLeaderboard";
import TeacherLeaderboard from "./TeacherLeaderboard";

const SchoolInsights = ({ schoolId }: { schoolId: string }) => {
  const languageQuery = useGetLanguage();
  const language = languageQuery.data ?? "en";

  const [educationYear, setEducationYear] = useState<
    EducationYear | undefined
  >();

  useEffect(() => {
    const def = getDefaultSubjectFilter({ schoolId });
    setEducationYear(
      def?.educationYear ?? (`1/${new Date().getFullYear()}` as EducationYear),
    );
  }, [schoolId]);

  const analytics = useGetSchoolAnalytics({ schoolId, educationYear });

  const updatedAt = analytics.data
    ? new Date(analytics.data.generatedAt).toLocaleString(
        language === "th" ? "th-TH" : "en-GB",
        { dateStyle: "medium", timeStyle: "short" },
      )
    : null;

  return (
    <div className="flex w-full flex-col justify-center bg-white font-Anuphan">
      <header className="mx-auto flex w-full flex-col justify-between gap-4 p-3 md:max-w-screen-md md:flex-row md:px-5 xl:max-w-screen-lg">
        <section className="min-w-0 text-center md:text-left">
          <h1 className="text-2xl font-semibold md:text-3xl">
            {L.title(language)}
          </h1>
          <p className="max-w-96 break-words text-sm text-gray-400 md:text-base">
            {L.description(language)}
          </p>
          {analytics.data && updatedAt && (
            <p className="mt-1 text-xs text-gray-400">
              {L.updated(language)} {updatedAt} (
              {analytics.data.source === "scheduled"
                ? L.sourceScheduled(language)
                : L.sourceOnDemand(language)}
              )
            </p>
          )}
        </section>
        {educationYear && (
          <label className="flex shrink-0 flex-col items-center md:items-end">
            <span className="text-sm text-gray-400">
              {L.educationYear(language)}
            </span>
            <InputEducationYear
              value={educationYear}
              onChange={(value) => setEducationYear(value as EducationYear)}
              required={false}
            />
          </label>
        )}
      </header>

      <main className="mx-auto flex min-h-screen w-full flex-col gap-4 p-3 pb-24 md:max-w-screen-md md:px-5 xl:max-w-screen-lg">
        {analytics.isLoading && <LoadingBar />}

        {analytics.error && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-error-color/40 bg-white p-6 text-center text-sm text-error-color">
            <TbAlertCircle className="shrink-0 text-lg" />
            {analytics.error.message || L.couldNotLoad(language)}
          </div>
        )}

        {analytics.data && educationYear && (
          <>
            <InsightSummaryCards data={analytics.data} language={language} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
              <AtRiskTable
                students={analytics.data.atRiskStudents}
                schoolId={schoolId}
                educationYear={educationYear}
                language={language}
              />
              <div className="flex flex-col gap-4">
                <ScoreDistributionBar
                  distribution={analytics.data.scoreDistribution}
                  language={language}
                />
                <ClassLeaderboard
                  classes={analytics.data.classLeaderboard}
                  schoolId={schoolId}
                  language={language}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SubjectLeaderboard
                subjects={analytics.data.subjectLeaderboard ?? []}
                schoolId={schoolId}
                language={language}
              />
              <TeacherLeaderboard
                teachers={analytics.data.teacherLeaderboard ?? []}
                language={language}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SchoolInsights;
