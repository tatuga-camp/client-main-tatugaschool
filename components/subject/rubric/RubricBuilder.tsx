import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import React, { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { MdOutlineDataSaverOn } from "react-icons/md";
import { RiSparkling2Line } from "react-icons/ri";
import { rubricLanguage } from "../../../data/languages";
import {
  ErrorMessages,
  Rubric,
  RubricDraft,
  RubricWithTree,
} from "../../../interfaces";
import {
  useCreateRubric,
  useGetLanguage,
  useGetRubricById,
  useUpdateRubric,
} from "../../../react-query";
import InputNumber from "../../common/InputNumber";
import PopupLayout from "../../layout/PopupLayout";
import RubricAiAssistant from "./RubricAiAssistant";

type Props = {
  subjectId: string;
  rubricId?: string;
  initialDraft?: RubricDraft;
  onSaved: (rubric: Rubric) => void;
  onCancel: () => void;
  toast: React.RefObject<Toast>;
};

// Shared performance-level column shown across every criterion row.
type Column = { title: string; points: number };
// One criterion row. `description[i]` is the descriptor for column `i`.
type Row = { title: string; weight: number; description: string[] };

type BuilderState = {
  title: string;
  description: string;
  columns: Column[];
  rows: Row[];
};

// Default starter matrix used for brand-new rubrics: 4 shared columns
// (points 4..1, high-to-low) and a single empty criterion row.
const DEFAULT_COLUMN_POINTS = [4, 3, 2, 1];

function emptyColumns(): Column[] {
  return DEFAULT_COLUMN_POINTS.map((points) => ({ title: "", points }));
}

function emptyRow(columnCount: number): Row {
  return {
    title: "",
    weight: 1,
    description: Array.from({ length: columnCount }, () => ""),
  };
}

function emptyState(): BuilderState {
  const columns = emptyColumns();
  return {
    title: "",
    description: "",
    columns,
    rows: [emptyRow(columns.length)],
  };
}

// Keep `row.description.length === columnCount` for every row by padding with
// "" or truncating. Used after add/remove column and when loading data whose
// per-criterion level counts may differ.
function alignDescription(
  description: string[],
  columnCount: number,
): string[] {
  const next = description.slice(0, columnCount);
  while (next.length < columnCount) next.push("");
  return next;
}

// Reconstruct the shared-column matrix state from a source that stores levels
// PER criterion (AI draft or fetched rubric). The first criterion's levels
// become the canonical columns; every row's descriptors are aligned by index.
type SourceCriterion = {
  title?: string;
  weight?: number;
  levels: Array<{ title?: string; description?: string; points?: number }>;
};

function criteriaToState(
  title: string,
  description: string,
  criteria: SourceCriterion[],
): BuilderState {
  if (criteria.length === 0) {
    const starter = emptyState();
    return { ...starter, title, description };
  }
  const columns: Column[] = criteria[0].levels.map((l) => ({
    title: l.title ?? "",
    points: l.points ?? 0,
  }));
  // Guard: a source with no levels still needs a usable matrix.
  if (columns.length === 0) {
    const fallback = emptyColumns();
    return {
      title,
      description,
      columns: fallback,
      rows: criteria.map((c) => ({
        title: c.title ?? "",
        weight: c.weight ?? 1,
        description: alignDescription([], fallback.length),
      })),
    };
  }
  const rows: Row[] = criteria.map((c) => ({
    title: c.title ?? "",
    weight: c.weight ?? 1,
    description: alignDescription(
      c.levels.map((l) => l.description ?? ""),
      columns.length,
    ),
  }));
  return { title, description, columns, rows };
}

function draftToState(draft: RubricDraft): BuilderState {
  return criteriaToState(
    draft.title ?? "",
    draft.description ?? "",
    draft.criteria,
  );
}

function rubricToState(data: RubricWithTree): BuilderState {
  const criteria = [...data.criteria]
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      title: c.title,
      weight: c.weight,
      levels: [...c.levels]
        .sort((a, b) => a.order - b.order)
        .map((l) => ({
          title: l.title,
          description: l.description,
          points: l.points,
        })),
    }));
  return criteriaToState(data.title ?? "", data.description ?? "", criteria);
}

function RubricBuilder({
  subjectId,
  rubricId,
  initialDraft,
  onSaved,
  onCancel,
  toast,
}: Props) {
  const create = useCreateRubric();
  const update = useUpdateRubric();
  const rubricQuery = useGetRubricById({ rubricId: rubricId ?? "" });
  const language = useGetLanguage();

  const [state, setState] = useState<BuilderState>(() => {
    if (initialDraft) {
      return draftToState(initialDraft);
    }
    if (rubricId) {
      // Will be seeded from the fetched data once it loads.
      return { title: "", description: "", columns: [], rows: [] };
    }
    return emptyState();
  });
  const [seededFromServer, setSeededFromServer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // Replace the builder's editing state with an AI-generated draft so the
  // teacher can review/edit before saving. Reuses the same draft mapping the
  // builder uses to seed from `initialDraft`.
  const applyDraft = (draft: RubricDraft) => {
    setState(draftToState(draft));
  };

  // Seed from fetched rubric (edit mode) once when data arrives.
  useEffect(() => {
    if (initialDraft) return;
    if (!rubricId) return;
    if (seededFromServer) return;
    const data = rubricQuery.data;
    if (!data) return;
    setState(rubricToState(data));
    setSeededFromServer(true);
  }, [initialDraft, rubricId, rubricQuery.data, seededFromServer]);

  const setTitle = (title: string) => setState((prev) => ({ ...prev, title }));
  const setDescription = (description: string) =>
    setState((prev) => ({ ...prev, description }));

  const updateColumn = (index: number, partial: Partial<Column>) => {
    setState((prev) => ({
      ...prev,
      columns: prev.columns.map((c, i) =>
        i === index ? { ...c, ...partial } : c,
      ),
    }));
  };

  const handleAddColumn = () => {
    setState((prev) => ({
      ...prev,
      columns: [...prev.columns, { title: "", points: 0 }],
      rows: prev.rows.map((r) => ({
        ...r,
        description: [...r.description, ""],
      })),
    }));
  };

  const handleRemoveColumn = (index: number) => {
    setState((prev) => {
      if (prev.columns.length <= 2) return prev;
      return {
        ...prev,
        columns: prev.columns.filter((_, i) => i !== index),
        rows: prev.rows.map((r) => ({
          ...r,
          description: r.description.filter((_, i) => i !== index),
        })),
      };
    });
  };

  const updateRow = (index: number, partial: Partial<Row>) => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.map((r, i) => (i === index ? { ...r, ...partial } : r)),
    }));
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.map((r, i) =>
        i === rowIndex
          ? {
              ...r,
              description: r.description.map((d, j) =>
                j === colIndex ? value : d,
              ),
            }
          : r,
      ),
    }));
  };

  const handleAddRow = () => {
    setState((prev) => ({
      ...prev,
      rows: [...prev.rows, emptyRow(prev.columns.length)],
    }));
  };

  const handleRemoveRow = (index: number) => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index),
    }));
  };

  const validationError = useMemo<string | null>(() => {
    const lang = language.data ?? "en";
    if (!state.title.trim()) return rubricLanguage.rubricTitleRequired(lang);
    if (state.rows.length < 1) return rubricLanguage.atLeastOneCriterion(lang);
    if (state.columns.length < 2) return rubricLanguage.atLeastTwoLevels(lang);
    for (let i = 0; i < state.columns.length; i++) {
      if (!state.columns[i].title.trim()) {
        return rubricLanguage.columnTitleRequired(lang)(i + 1);
      }
    }
    for (let i = 0; i < state.rows.length; i++) {
      if (!state.rows[i].title.trim()) {
        return rubricLanguage.criterionRequiresTitle(lang)(i + 1);
      }
    }
    return null;
  }, [state, language.data]);

  const maxRawPoints = useMemo(() => {
    const maxColumnPoints = state.columns.reduce(
      (m, c) => (c.points > m ? c.points : m),
      0,
    );
    return state.rows.reduce(
      (sum, r) => sum + maxColumnPoints * (r.weight ?? 0),
      0,
    );
  }, [state]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) return;
    try {
      setLoading(true);
      const criteria = state.rows.map((row, rowIndex) => ({
        title: row.title.trim(),
        description: undefined,
        weight: row.weight ?? 0,
        order: rowIndex,
        levels: state.columns.map((col, i) => ({
          title: col.title.trim(),
          description: row.description[i]?.trim() || undefined,
          points: col.points ?? 0,
          order: i,
        })),
      }));

      let result: Rubric;
      if (rubricId) {
        result = await update.mutateAsync({
          rubricId,
          title: state.title.trim(),
          description: state.description.trim() || undefined,
          subjectId,
          criteria,
        });
      } else {
        result = await create.mutateAsync({
          title: state.title.trim(),
          description: state.description.trim() || undefined,
          subjectId,
          criteria,
        });
      }

      setLoading(false);
      toast.current?.show({
        severity: "success",
        summary: rubricLanguage.success(language.data ?? "en"),
        detail: rubricId
          ? rubricLanguage.rubricUpdated(language.data ?? "en")
          : rubricLanguage.rubricCreated(language.data ?? "en"),
        life: 3000,
      });
      onSaved(result);
    } catch (error) {
      console.log(error);
      setLoading(false);
      const result = error as ErrorMessages;
      toast.current?.show({
        severity: "error",
        summary: result?.error
          ? result.error
          : rubricLanguage.somethingWentWrong(language.data ?? "en"),
        detail: result?.message
          ? result.message.toString()
          : rubricLanguage.couldNotSaveRubric(language.data ?? "en"),
        life: 5000,
      });
    }
  };

  const lang = language.data ?? "en";

  return (
    <form
      onSubmit={handleSave}
      className="flex h-max w-full flex-col gap-3 rounded-2xl border bg-gray-100 p-4"
    >
      {loading && (
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
      )}

      <header className="flex w-full flex-col gap-2 border-b pb-3">
        <div className="flex w-full items-center justify-between gap-2">
          <h1 className="text-lg font-medium">
            {rubricId
              ? rubricLanguage.editRubricHeading(lang)
              : rubricLanguage.createRubricHeading(lang)}
          </h1>
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            disabled={loading}
            className="second-button flex w-max items-center justify-center gap-1 border py-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RiSparkling2Line /> {rubricLanguage.draftWithAi(lang)}
          </button>
        </div>
        <input
          type="text"
          placeholder={rubricLanguage.rubricTitlePlaceholder(lang)}
          value={state.title}
          onChange={(e) => setTitle(e.target.value)}
          className="gradient-bg w-full rounded-xl border-none px-4 py-3 text-lg font-semibold text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-primary-color"
        />
        <textarea
          placeholder={rubricLanguage.descriptionOptionalPlaceholder(lang)}
          value={state.description}
          onChange={(e) => setDescription(e.target.value)}
          className="main-input w-full resize-none"
          rows={2}
        />
      </header>

      <main className="flex max-h-[60vh] w-full flex-col gap-3 overflow-auto">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-56 min-w-56 border bg-gray-100 p-2 text-left align-top text-sm font-semibold text-primary-color">
                  {rubricLanguage.criteriaColumnHeader(lang)}
                </th>
                {state.columns.map((column, cIndex) => (
                  <th
                    key={cIndex}
                    className="w-48 min-w-48 border bg-gray-100 p-2 align-top"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-1">
                        <input
                          type="text"
                          placeholder={rubricLanguage.levelTitlePlaceholder(
                            lang,
                          )}
                          value={column.title}
                          onChange={(e) =>
                            updateColumn(cIndex, { title: e.target.value })
                          }
                          className="main-input w-full text-sm"
                        />
                        <button
                          type="button"
                          title={rubricLanguage.removeLevel(lang)}
                          onClick={() => handleRemoveColumn(cIndex)}
                          disabled={state.columns.length <= 2}
                          className="rounded bg-red-100 p-1 text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <IoMdClose />
                        </button>
                      </div>
                      <div className="flex w-24 items-center gap-1">
                        <InputNumber
                          value={column.points}
                          min={0}
                          placeholder={rubricLanguage.pts(lang)}
                          onValueChange={(value) =>
                            updateColumn(cIndex, { points: value ?? 0 })
                          }
                        />
                        <span className="text-xs text-gray-500">
                          {rubricLanguage.pts(lang)}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="w-32 min-w-32 border bg-primary-color/10 p-2 align-top">
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="second-button flex w-full items-center justify-center gap-1 border text-sm"
                  >
                    <FiPlus /> {rubricLanguage.addLevel(lang)}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {state.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="align-top">
                  <td className="sticky left-0 z-10 w-56 min-w-56 border bg-white p-2">
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder={rubricLanguage.criterionTitlePlaceholder(
                          lang,
                        )}
                        value={row.title}
                        onChange={(e) =>
                          updateRow(rowIndex, { title: e.target.value })
                        }
                        className="main-input w-full text-sm"
                      />
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">
                          {rubricLanguage.weight(lang)}
                        </label>
                        <InputNumber
                          value={row.weight}
                          min={0}
                          placeholder={rubricLanguage.weight(lang)}
                          onValueChange={(value) =>
                            updateRow(rowIndex, { weight: value ?? 0 })
                          }
                        />
                      </div>
                      <button
                        type="button"
                        title={rubricLanguage.removeCriterion(lang)}
                        onClick={() => handleRemoveRow(rowIndex)}
                        className="flex w-max items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-500"
                      >
                        <IoMdClose /> {rubricLanguage.removeCriterion(lang)}
                      </button>
                    </div>
                  </td>
                  {state.columns.map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className="w-48 min-w-48 border bg-white p-2"
                    >
                      <textarea
                        placeholder={rubricLanguage.levelDescriptionPlaceholder(
                          lang,
                        )}
                        value={row.description[colIndex] ?? ""}
                        onChange={(e) =>
                          updateCell(rowIndex, colIndex, e.target.value)
                        }
                        className="main-input min-h-24 w-full resize-y text-sm"
                      />
                    </td>
                  ))}
                  <td className="w-32 min-w-32 border bg-gray-50" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          className="second-button flex w-max items-center justify-center gap-1 border"
        >
          <FiPlus /> {rubricLanguage.addCriterion(lang)}
        </button>
      </main>

      <footer className="flex w-full flex-col gap-2 border-t pt-3">
        <div className="flex w-full items-center justify-between text-sm text-gray-500">
          <span>
            {rubricLanguage.maxRawPoints(lang)} {maxRawPoints}
          </span>
          {validationError && (
            <span className="text-red-500">{validationError}</span>
          )}
        </div>
        <div className="flex w-full justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="second-button flex items-center justify-center gap-1 border"
          >
            {rubricLanguage.cancel(lang)}
          </button>
          <button
            type="submit"
            disabled={!!validationError || loading}
            className="main-button flex items-center justify-center gap-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
          >
            <MdOutlineDataSaverOn /> {rubricLanguage.save(lang)}
          </button>
        </div>
      </footer>

      {aiOpen && (
        <PopupLayout
          onClose={() => {
            document.body.style.overflow = "auto";
            setAiOpen(false);
          }}
        >
          <div className="h-max max-h-[90vh] w-[95vw] max-w-2xl overflow-auto rounded-2xl border bg-background-color p-2">
            <RubricAiAssistant
              subjectId={subjectId}
              toast={toast}
              onDraft={(draft) => applyDraft(draft)}
              onClose={() => {
                document.body.style.overflow = "auto";
                setAiOpen(false);
              }}
            />
          </div>
        </PopupLayout>
      )}
    </form>
  );
}

export default RubricBuilder;
