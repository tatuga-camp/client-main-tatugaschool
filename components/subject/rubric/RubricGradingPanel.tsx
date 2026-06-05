import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import React from "react";
import { CiSaveUp2 } from "react-icons/ci";
import { rubricLanguage } from "../../../data/languages";
import { RubricWithTree } from "../../../interfaces";
import { useGetLanguage, useGetRubricById, useGetRubricBreakdown, useGradeRubric } from "../../../react-query";
import { computeRubricScore } from "./rubricMath";

type Props = {
  rubricId: string;
  assignmentMaxScore: number | null;
  studentOnAssignmentId: string;
  toast: React.RefObject<Toast>;
  onGraded: (score: number) => void;
};

type Selection = { selectedLevelId: string | null; comment: string };

function maxLevelPoints(levels: { points: number }[]): number {
  return levels.reduce((m, l) => (l.points > m ? l.points : m), 0);
}

function RubricGradingPanel({
  rubricId,
  assignmentMaxScore,
  studentOnAssignmentId,
  toast,
  onGraded,
}: Props) {
  const rubricQuery = useGetRubricById({ rubricId });
  const breakdownQuery = useGetRubricBreakdown({ studentOnAssignmentId });
  const grade = useGradeRubric();
  const language = useGetLanguage();

  const [selections, setSelections] = React.useState<Record<string, Selection>>(
    {},
  );
  const [seeded, setSeeded] = React.useState(false);

  // Preselect existing grades from the breakdown once it loads.
  React.useEffect(() => {
    if (seeded) return;
    const breakdown = breakdownQuery.data;
    if (!breakdown) return;
    const next: Record<string, Selection> = {};
    breakdown.rubric?.criteria.forEach((c) => {
      next[c.id] = {
        selectedLevelId: c.selectedLevelId ?? null,
        comment: c.comment ?? "",
      };
    });
    setSelections(next);
    setSeeded(true);
  }, [breakdownQuery.data, seeded]);

  const rubric: RubricWithTree | undefined = rubricQuery.data;

  const criteria = React.useMemo(() => {
    if (!rubric) return [];
    return [...rubric.criteria].sort((a, b) => a.order - b.order);
  }, [rubric]);

  const setSelection = (criterionId: string, partial: Partial<Selection>) => {
    setSelections((prev) => ({
      ...prev,
      [criterionId]: {
        selectedLevelId: prev[criterionId]?.selectedLevelId ?? null,
        comment: prev[criterionId]?.comment ?? "",
        ...partial,
      },
    }));
  };

  const liveScore = React.useMemo(() => {
    if (criteria.length === 0) return 0;
    const mathCriteria = criteria.map((c) => ({
      weight: c.weight,
      maxPoints: maxLevelPoints(c.levels),
    }));
    const mathSelections = criteria.flatMap((c) => {
      const selectedLevelId = selections[c.id]?.selectedLevelId;
      if (!selectedLevelId) return [];
      const level = c.levels.find((l) => l.id === selectedLevelId);
      if (!level) return [];
      return [{ points: level.points, weight: c.weight }];
    });
    return computeRubricScore({
      criteria: mathCriteria,
      selections: mathSelections,
      maxScore: assignmentMaxScore,
    });
  }, [criteria, selections, assignmentMaxScore]);

  const displayScore = Math.round(liveScore * 100) / 100;

  const selectedCount = React.useMemo(
    () =>
      criteria.filter((c) => !!selections[c.id]?.selectedLevelId).length,
    [criteria, selections],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCount === 0) return;
    try {
      const items = criteria
        .filter((c) => !!selections[c.id]?.selectedLevelId)
        .map((c) => ({
          criterionId: c.id,
          selectedLevelId: selections[c.id].selectedLevelId as string,
          comment: selections[c.id].comment || undefined,
        }));
      const result = await grade.mutateAsync({
        studentOnAssignmentId,
        items,
      });
      toast.current?.show({
        severity: "success",
        summary: rubricLanguage.updateSuccess(language.data ?? "en"),
        detail: rubricLanguage.scoreUpdated(language.data ?? "en"),
      });
      onGraded(result.score);
    } catch (error) {
      const result = error as
        | { message?: string | string[]; error?: string }
        | undefined;
      toast.current?.show({
        severity: "error",
        summary: result?.error
          ? result.error
          : rubricLanguage.somethingWentWrong(language.data ?? "en"),
        detail: result?.message
          ? result.message.toString()
          : rubricLanguage.couldNotGradeRubric(language.data ?? "en"),
        life: 5000,
      });
    }
  };

  if (rubricQuery.isLoading || breakdownQuery.isLoading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <ProgressSpinner
          animationDuration="1s"
          style={{ width: "40px" }}
          className="h-10 w-10"
          strokeWidth="6"
        />
      </div>
    );
  }

  if (rubricQuery.isError || !rubric) {
    return (
      <div className="flex h-40 w-full items-center justify-center text-red-500">
        {rubricLanguage.couldNotLoadRubric(language.data ?? "en")}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-max w-full flex-col items-start gap-3"
    >
      <div className="flex w-full items-center justify-between gap-2 border-b pb-2">
        <div className="flex flex-col">
          <h1 className="max-w-60 truncate text-base font-medium">
            {rubric.title}
          </h1>
          <span className="text-xs text-gray-500">
            {rubricLanguage.gradeWithRubric(language.data ?? "en")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">
            {rubricLanguage.score(language.data ?? "en")} {displayScore}
            {assignmentMaxScore != null && ` / ${assignmentMaxScore}`}
          </span>
          {grade.isPending ? (
            <div className="h-8">
              <ProgressSpinner
                animationDuration="1s"
                style={{ width: "20px" }}
                className="h-5 w-5"
                strokeWidth="8"
              />
            </div>
          ) : (
            <button
              type="submit"
              disabled={selectedCount === 0}
              title={
                selectedCount === 0
                  ? rubricLanguage.selectLevelHint(language.data ?? "en")
                  : undefined
              }
              className="main-button flex h-8 items-center justify-center gap-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
            >
              <CiSaveUp2 />
              {rubricLanguage.saveGrade(language.data ?? "en")}
            </button>
          )}
        </div>
      </div>

      <div className="flex max-h-[60vh] w-full flex-col gap-4 overflow-auto">
        {criteria.map((criterion) => {
          const levels = [...criterion.levels].sort((a, b) => a.order - b.order);
          const selection = selections[criterion.id];
          return (
            <section
              key={criterion.id}
              className="flex w-full flex-col gap-3 rounded-2xl border bg-white p-3"
            >
              <header className="flex w-full items-start justify-between gap-2">
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold text-gray-800">
                    {criterion.title}
                  </span>
                  {criterion.description && (
                    <span className="text-xs text-gray-500">
                      {criterion.description}
                    </span>
                  )}
                </div>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                  {rubricLanguage.weightLabel(language.data ?? "en")}{" "}
                  {criterion.weight}
                </span>
              </header>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {levels.map((level) => {
                  const isSelected = selection?.selectedLevelId === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() =>
                        setSelection(criterion.id, { selectedLevelId: level.id })
                      }
                      className={`flex flex-col gap-1 rounded-2xl border p-2 text-left transition ${
                        isSelected
                          ? "border-primary-color bg-primary-color/10 ring-2 ring-primary-color"
                          : "border bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">
                          {level.title}
                        </span>
                        <span className="text-xs font-semibold text-gray-500">
                          {level.points} {rubricLanguage.pts(language.data ?? "en")}
                        </span>
                      </div>
                      {level.description && (
                        <span className="text-xs text-gray-500">
                          {level.description}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <label className="flex w-full flex-col gap-1">
                <span className="text-xs text-gray-500">
                  {rubricLanguage.commentOptional(language.data ?? "en")}
                </span>
                <textarea
                  value={selection?.comment ?? ""}
                  onChange={(e) =>
                    setSelection(criterion.id, { comment: e.target.value })
                  }
                  className="main-input w-full resize-none"
                  rows={2}
                  placeholder={rubricLanguage.criterionFeedbackPlaceholder(
                    language.data ?? "en",
                  )}
                />
              </label>
            </section>
          );
        })}
      </div>
    </form>
  );
}

export default RubricGradingPanel;
