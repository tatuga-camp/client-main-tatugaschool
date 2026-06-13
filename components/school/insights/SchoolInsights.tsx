import React, { useEffect, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { TbReportAnalytics, TbAlertCircle } from "react-icons/tb";
import { EducationYear } from "@/interfaces";
import { useGetSchoolAnalytics } from "../../../react-query/analytics";
import { useGetLanguage } from "../../../react-query";
import { getDefaultSubjectFilter } from "../../../utils/localstorage";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import InputEducationYear from "../../common/InputEducationYear";
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

  return (
    <section className="bg-background-color px-4 pb-16 pt-4 md:px-12">
      {/* Hero header */}
      <div className="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-color via-primary-color to-secondary-color p-6 text-white shadow-lg">
        {/* decorative glow */}
        <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-secondary-color/40 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-Anuphan text-2xl font-bold tracking-tight">
              <TbReportAnalytics className="text-3xl" />
              {L.title(language)}
            </h2>
            {analytics.data && (
              <p className="mt-1 font-Anuphan text-xs text-white/80">
                {L.updated(language)}{" "}
                {new Date(analytics.data.generatedAt).toLocaleString()}{" "}
                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5">
                  {analytics.data.source === "scheduled"
                    ? L.sourceScheduled(language)
                    : L.sourceOnDemand(language)}
                </span>
              </p>
            )}
          </div>

          {educationYear && (
            <div className="rounded-2xl bg-white/95 p-3 text-black shadow-md backdrop-blur">
              <label className="mb-1 block font-Anuphan text-xs font-medium text-icon-color">
                {L.educationYear(language)}
              </label>
              <InputEducationYear
                value={educationYear}
                onChange={(value) => setEducationYear(value as EducationYear)}
                required={false}
              />
            </div>
          )}
        </div>
      </div>

      {analytics.isLoading && (
        <div className="flex justify-center py-16">
          <ProgressSpinner
            style={{ width: "44px", height: "44px" }}
            strokeWidth="4"
          />
        </div>
      )}

      {analytics.error && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-error-color/30 bg-error-color/5 p-8 text-center font-Anuphan text-error-color">
          <TbAlertCircle className="text-xl" />
          {analytics.error.message || L.couldNotLoad(language)}
        </div>
      )}

      {analytics.data && educationYear && (
        <div className="flex flex-col gap-4">
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
                language={language}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SubjectLeaderboard
              subjects={analytics.data.subjectLeaderboard ?? []}
              language={language}
            />
            <TeacherLeaderboard
              teachers={analytics.data.teacherLeaderboard ?? []}
              language={language}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default SchoolInsights;
