import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import Switch from "../common/Switch";
import { quizLanguage } from "../../data/languages";
import {
  Assignment,
  ErrorMessages,
  QuizScoringMode,
  QuizSettings,
} from "../../interfaces";
import { useGetLanguage, useUpdateAssignment } from "../../react-query";
import { convertToDateTimeLocalString } from "../../utils";
import { rebaseDraft } from "../../utils/quizDraft";

const DEFAULTS: QuizSettings = {
  scoringMode: "ALL_OR_NOTHING",
  timeLimitMinutes: null,
  shuffleQuestions: false,
  shuffleOptions: false,
  testMode: false,
  showAnswersAfterSubmit: false,
};

type Form = {
  description: string;
  beginDate: string;
  dueDate: string;
  allowStudentViewScore: boolean;
  settings: QuizSettings;
};

const toForm = (a: Assignment): Form => ({
  description: a.description ?? "",
  beginDate: convertToDateTimeLocalString(new Date(a.beginDate)),
  dueDate: a.dueDate ? convertToDateTimeLocalString(new Date(a.dueDate)) : "",
  allowStudentViewScore: a.allowStudentViewScore ?? true,
  settings: { ...DEFAULTS, ...(a.quizSettings ?? {}) },
});

export default function QuizSettingsPanel({
  assignment,
}: {
  assignment: Assignment;
}) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const update = useUpdateAssignment();
  const [form, setForm] = useState<Form>(() => toForm(assignment));
  const serverForm = useMemo(() => toForm(assignment), [assignment]);
  const serverKey = JSON.stringify(serverForm);
  const baseRef = useRef({ id: assignment.id, form: serverForm });

  // The header's title save and Publish button also update the assignment. Follow those
  // changes only while the form has no unsaved edits; a different quiz always resets.
  useEffect(() => {
    const prev = baseRef.current;
    baseRef.current = { id: assignment.id, form: serverForm };
    setForm((f) =>
      prev.id !== assignment.id
        ? serverForm
        : rebaseDraft(f, prev.form, serverForm),
    );
  }, [assignment.id, serverKey]);

  const beginDateMissing = !form.beginDate;

  const setSetting = <K extends keyof QuizSettings>(
    key: K,
    value: QuizSettings[K],
  ) => setForm((f) => ({ ...f, settings: { ...f.settings, [key]: value } }));

  const save = async () => {
    if (beginDateMissing) return;
    try {
      const saved = await update.mutateAsync({
        query: { assignmentId: assignment.id },
        data: {
          description: form.description,
          beginDate: new Date(form.beginDate).toISOString(),
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
          allowStudentViewScore: form.allowStudentViewScore,
          quizSettings: form.settings,
        },
      });
      setForm(toForm({ ...assignment, ...saved }));
      Swal.fire({
        icon: "success",
        title: quizLanguage.saved(lang),
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      const result = error as ErrorMessages;
      Swal.fire({
        title: result?.error ?? "Error",
        text: result?.message?.toString(),
        icon: "error",
      });
    }
  };

  const toggle = (
    label: string,
    checked: boolean,
    onChange: (v: boolean) => void,
    hint?: string,
  ) => (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <div className="font-medium text-icon-color">{label}</div>
        {hint && (
          <p className="mt-1 max-w-prose text-sm text-icon-color/60">{hint}</p>
        )}
      </div>
      <Switch checked={checked} setChecked={onChange} />
    </div>
  );

  const scoringCard = (mode: QuizScoringMode, title: string, hint: string) => (
    <button
      type="button"
      onClick={() => setSetting("scoringMode", mode)}
      className={`flex-1 rounded-2xl border p-3 text-left transition ${
        form.settings.scoringMode === mode
          ? "border-primary-color bg-primary-color/5 ring-2 ring-primary-color/20"
          : "border-gray-200 hover:border-primary-color/40"
      }`}
    >
      <div className="font-medium text-icon-color">{title}</div>
      <p className="mt-1 text-sm text-icon-color/60">{hint}</p>
    </button>
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 font-Anuphan md:p-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-icon-color">
          {quizLanguage.description(lang)}
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="main-input w-full resize-y font-normal"
          />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-icon-color">
            {quizLanguage.beginDate(lang)}
            <input
              type="datetime-local"
              value={form.beginDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, beginDate: e.target.value }))
              }
              aria-invalid={beginDateMissing}
              className={`main-input ${beginDateMissing ? "border-error-color" : ""}`}
            />
            {beginDateMissing && (
              <span className="text-xs font-normal text-error-color">
                {quizLanguage.beginDateRequired(lang)}
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-icon-color">
            {quizLanguage.dueDate(lang)}
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueDate: e.target.value }))
              }
              className="main-input"
            />
            {!form.dueDate && (
              <span className="text-xs font-normal text-icon-color/50">
                {quizLanguage.noDueDate(lang)}
              </span>
            )}
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4">
        <h3 className="mb-3 font-semibold text-icon-color">
          {quizLanguage.scoring(lang)}
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          {scoringCard(
            "ALL_OR_NOTHING",
            quizLanguage.allOrNothing(lang),
            quizLanguage.allOrNothingHint(lang),
          )}
          {scoringCard(
            "PARTIAL",
            quizLanguage.partial(lang),
            quizLanguage.partialHint(lang),
          )}
        </div>
        <label className="mt-4 flex flex-col gap-1 text-sm font-medium text-icon-color">
          {quizLanguage.timeLimit(lang)}
          <input
            type="number"
            min={1}
            max={600}
            value={form.settings.timeLimitMinutes ?? ""}
            onChange={(e) =>
              setSetting(
                "timeLimitMinutes",
                e.target.value === ""
                  ? null
                  : Math.max(1, Math.min(600, Number(e.target.value))),
              )
            }
            className="main-input w-40"
          />
          <span className="text-xs font-normal text-icon-color/50">
            {quizLanguage.timeLimitHint(lang)}
          </span>
        </label>
      </section>

      <section className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white px-4">
        {toggle(
          quizLanguage.testMode(lang),
          form.settings.testMode,
          (v) => setSetting("testMode", v),
          quizLanguage.testModeHint(lang),
        )}
        {toggle(
          quizLanguage.shuffleQuestions(lang),
          form.settings.shuffleQuestions,
          (v) => setSetting("shuffleQuestions", v),
        )}
        {toggle(
          quizLanguage.shuffleOptions(lang),
          form.settings.shuffleOptions,
          (v) => setSetting("shuffleOptions", v),
        )}
        {toggle(
          quizLanguage.showAnswers(lang),
          form.settings.showAnswersAfterSubmit,
          (v) => setSetting("showAnswersAfterSubmit", v),
        )}
        {toggle(
          quizLanguage.allowViewScore(lang),
          form.allowStudentViewScore,
          (v) => setForm((f) => ({ ...f, allowStudentViewScore: v })),
        )}
      </section>

      <button
        type="button"
        onClick={save}
        disabled={update.isPending || beginDateMissing}
        className="self-end rounded-2xl bg-primary-color px-6 py-2 font-medium text-white hover:bg-primary-color-hover disabled:opacity-50"
      >
        {quizLanguage.saveSettings(lang)}
      </button>
    </div>
  );
}
