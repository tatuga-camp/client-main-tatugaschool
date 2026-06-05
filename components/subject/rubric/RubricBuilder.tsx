import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import React, { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { MdDelete, MdOutlineDataSaverOn } from "react-icons/md";
import { ErrorMessages, Rubric, RubricDraft } from "../../../interfaces";
import { useCreateRubric, useGetRubricById, useUpdateRubric } from "../../../react-query";
import InputNumber from "../../common/InputNumber";

type Props = {
  subjectId: string;
  rubricId?: string;
  initialDraft?: RubricDraft;
  onSaved: (rubric: Rubric) => void;
  onCancel: () => void;
  toast: React.RefObject<Toast>;
};

type LevelState = {
  title: string;
  description: string;
  points: number;
};

type CriterionState = {
  title: string;
  description: string;
  weight: number;
  levels: LevelState[];
};

type BuilderState = {
  title: string;
  description: string;
  criteria: CriterionState[];
};

function emptyLevel(): LevelState {
  return { title: "", description: "", points: 0 };
}

function emptyCriterion(): CriterionState {
  return { title: "", description: "", weight: 1, levels: [emptyLevel(), emptyLevel()] };
}

function draftToState(draft: RubricDraft): BuilderState {
  return {
    title: draft.title ?? "",
    description: draft.description ?? "",
    criteria: draft.criteria.map((c) => ({
      title: c.title ?? "",
      description: c.description ?? "",
      weight: c.weight ?? 1,
      levels: c.levels.map((l) => ({
        title: l.title ?? "",
        description: l.description ?? "",
        points: l.points ?? 0,
      })),
    })),
  };
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

  const [state, setState] = useState<BuilderState>(() => {
    if (initialDraft) {
      return draftToState(initialDraft);
    }
    if (rubricId) {
      // Will be seeded from the fetched data once it loads.
      return { title: "", description: "", criteria: [] };
    }
    return { title: "", description: "", criteria: [emptyCriterion()] };
  });
  const [seededFromServer, setSeededFromServer] = useState(false);
  const [loading, setLoading] = useState(false);

  // Seed from fetched rubric (edit mode) once when data arrives.
  useEffect(() => {
    if (initialDraft) return;
    if (!rubricId) return;
    if (seededFromServer) return;
    const data = rubricQuery.data;
    if (!data) return;
    setState({
      title: data.title ?? "",
      description: data.description ?? "",
      criteria: [...data.criteria]
        .sort((a, b) => a.order - b.order)
        .map((c) => ({
          title: c.title ?? "",
          description: c.description ?? "",
          weight: c.weight ?? 1,
          levels: [...c.levels]
            .sort((a, b) => a.order - b.order)
            .map((l) => ({
              title: l.title ?? "",
              description: l.description ?? "",
              points: l.points ?? 0,
            })),
        })),
    });
    setSeededFromServer(true);
  }, [initialDraft, rubricId, rubricQuery.data, seededFromServer]);

  const updateCriterion = (index: number, partial: Partial<CriterionState>) => {
    setState((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c, i) => (i === index ? { ...c, ...partial } : c)),
    }));
  };

  const updateLevel = (
    cIndex: number,
    lIndex: number,
    partial: Partial<LevelState>,
  ) => {
    setState((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c, i) =>
        i === cIndex
          ? {
              ...c,
              levels: c.levels.map((l, j) =>
                j === lIndex ? { ...l, ...partial } : l,
              ),
            }
          : c,
      ),
    }));
  };

  const handleAddCriterion = () => {
    setState((prev) => ({ ...prev, criteria: [...prev.criteria, emptyCriterion()] }));
  };

  const handleRemoveCriterion = (index: number) => {
    setState((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index),
    }));
  };

  const handleAddLevel = (cIndex: number) => {
    setState((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c, i) =>
        i === cIndex ? { ...c, levels: [...c.levels, emptyLevel()] } : c,
      ),
    }));
  };

  const handleRemoveLevel = (cIndex: number, lIndex: number) => {
    setState((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c, i) =>
        i === cIndex
          ? { ...c, levels: c.levels.filter((_, j) => j !== lIndex) }
          : c,
      ),
    }));
  };

  const validationError = useMemo<string | null>(() => {
    if (!state.title.trim()) return "Rubric title is required";
    if (state.criteria.length < 1) return "At least one criterion is required";
    for (let i = 0; i < state.criteria.length; i++) {
      const c = state.criteria[i];
      if (!c.title.trim()) return `Criterion ${i + 1} requires a title`;
      if (c.levels.length < 2) {
        return `Criterion ${i + 1} requires at least 2 levels`;
      }
      for (let j = 0; j < c.levels.length; j++) {
        if (!c.levels[j].title.trim()) {
          return `Criterion ${i + 1}, level ${j + 1} requires a title`;
        }
      }
    }
    return null;
  }, [state]);

  const maxRawPoints = useMemo(() => {
    return state.criteria.reduce((sum, c) => {
      const maxPoints = c.levels.reduce(
        (m, l) => (l.points > m ? l.points : m),
        0,
      );
      return sum + maxPoints * (c.weight ?? 0);
    }, 0);
  }, [state]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) return;
    try {
      setLoading(true);
      const criteria = state.criteria.map((c, cIndex) => ({
        title: c.title.trim(),
        description: c.description.trim() || undefined,
        weight: c.weight ?? 0,
        order: cIndex,
        levels: c.levels.map((l, lIndex) => ({
          title: l.title.trim(),
          description: l.description.trim() || undefined,
          points: l.points ?? 0,
          order: lIndex,
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
        summary: "Success",
        detail: rubricId ? "Rubric has been updated" : "Rubric has been created",
        life: 3000,
      });
      onSaved(result);
    } catch (error) {
      console.log(error);
      setLoading(false);
      const result = error as ErrorMessages;
      toast.current?.show({
        severity: "error",
        summary: result?.error ? result.error : "Something Went Wrong",
        detail: result?.message
          ? result.message.toString()
          : "Could not save rubric",
        life: 5000,
      });
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="flex h-max w-full flex-col gap-3 rounded-2xl border bg-gray-100 p-4"
    >
      {loading && <ProgressBar mode="indeterminate" style={{ height: "6px" }} />}

      <header className="flex w-full flex-col gap-2 border-b pb-3">
        <h1 className="text-lg font-medium">
          {rubricId ? "Edit Rubric" : "Create Rubric"}
        </h1>
        <input
          type="text"
          placeholder="Rubric title"
          value={state.title}
          onChange={(e) => setState((prev) => ({ ...prev, title: e.target.value }))}
          className="main-input w-full"
        />
        <textarea
          placeholder="Description (optional)"
          value={state.description}
          onChange={(e) =>
            setState((prev) => ({ ...prev, description: e.target.value }))
          }
          className="main-input w-full resize-none"
          rows={2}
        />
      </header>

      <main className="flex max-h-[60vh] w-full flex-col gap-4 overflow-auto">
        {state.criteria.map((criterion, cIndex) => (
          <RubricCriterionRow
            key={cIndex}
            index={cIndex}
            criterion={criterion}
            onChange={(partial) => updateCriterion(cIndex, partial)}
            onChangeLevel={(lIndex, partial) => updateLevel(cIndex, lIndex, partial)}
            onAddLevel={() => handleAddLevel(cIndex)}
            onRemoveLevel={(lIndex) => handleRemoveLevel(cIndex, lIndex)}
            onRemove={() => handleRemoveCriterion(cIndex)}
          />
        ))}

        <button
          type="button"
          onClick={handleAddCriterion}
          className="second-button flex items-center justify-center gap-1 border"
        >
          <FiPlus /> Add criterion
        </button>
      </main>

      <footer className="flex w-full flex-col gap-2 border-t pt-3">
        <div className="flex w-full items-center justify-between text-sm text-gray-500">
          <span>Max raw points: {maxRawPoints}</span>
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
            Cancel
          </button>
          <button
            type="submit"
            disabled={!!validationError || loading}
            className="main-button flex items-center justify-center gap-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
          >
            <MdOutlineDataSaverOn /> Save
          </button>
        </div>
      </footer>
    </form>
  );
}

export default RubricBuilder;

type RubricCriterionRowProps = {
  index: number;
  criterion: CriterionState;
  onChange: (partial: Partial<CriterionState>) => void;
  onChangeLevel: (lIndex: number, partial: Partial<LevelState>) => void;
  onAddLevel: () => void;
  onRemoveLevel: (lIndex: number) => void;
  onRemove: () => void;
};

function RubricCriterionRow({
  index,
  criterion,
  onChange,
  onChangeLevel,
  onAddLevel,
  onRemoveLevel,
  onRemove,
}: RubricCriterionRowProps) {
  return (
    <section className="flex w-full flex-col gap-3 rounded-2xl border bg-white p-3">
      <header className="flex w-full items-start justify-between gap-2">
        <span className="mt-2 text-sm font-semibold text-gray-500">
          #{index + 1}
        </span>
        <div className="flex flex-1 flex-col gap-2">
          <input
            type="text"
            placeholder="Criterion title"
            value={criterion.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="main-input w-full"
          />
          <textarea
            placeholder="Criterion description (optional)"
            value={criterion.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="main-input w-full resize-none"
            rows={1}
          />
        </div>
        <div className="flex w-28 flex-col gap-1">
          <label className="text-xs text-gray-500">Weight</label>
          <InputNumber
            value={criterion.weight}
            min={0}
            placeholder="Weight"
            onValueChange={(value) => onChange({ weight: value ?? 0 })}
          />
        </div>
        <button
          type="button"
          title="Remove criterion"
          onClick={onRemove}
          className="mt-1 rounded bg-red-100 p-2 text-red-500"
        >
          <MdDelete />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {criterion.levels.map((level, lIndex) => (
          <div
            key={lIndex}
            className="flex flex-col gap-2 rounded-2xl border bg-gray-50 p-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Level {lIndex + 1}
              </span>
              <button
                type="button"
                title="Remove level"
                onClick={() => onRemoveLevel(lIndex)}
                className="rounded bg-red-100 p-1 text-red-500"
              >
                <IoMdClose />
              </button>
            </div>
            <input
              type="text"
              placeholder="Level title"
              value={level.title}
              onChange={(e) => onChangeLevel(lIndex, { title: e.target.value })}
              className="main-input w-full"
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Points</label>
              <InputNumber
                value={level.points}
                min={0}
                placeholder="Points"
                onValueChange={(value) =>
                  onChangeLevel(lIndex, { points: value ?? 0 })
                }
              />
            </div>
            <textarea
              placeholder="Level description (optional)"
              value={level.description}
              onChange={(e) =>
                onChangeLevel(lIndex, { description: e.target.value })
              }
              className="main-input w-full resize-none"
              rows={2}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddLevel}
        className="second-button flex w-max items-center justify-center gap-1 border"
      >
        <FiPlus /> Add level
      </button>
    </section>
  );
}
