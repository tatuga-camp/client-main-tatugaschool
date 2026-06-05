import { DropdownChangeEvent } from "primereact/dropdown";
import React, { useMemo } from "react";
import { rubricLanguage } from "../../../data/languages";
import { useGetLanguage, useGetRubricsBySubject } from "../../../react-query";
import Dropdown from "../../common/Dropdown";

type Props = {
  subjectId: string;
  value: string | null;
  onChange: (rubricId: string | null) => void;
  disabled?: boolean;
};

// Sentinel id used by the "No rubric" option, since the dropdown options are
// objects and `null` cannot be represented as an option value.
const NO_RUBRIC = "__none__";

type RubricOption = {
  label: string;
  id: string;
};

function RubricPicker({ subjectId, value, onChange, disabled }: Props) {
  const rubrics = useGetRubricsBySubject({ subjectId });
  const language = useGetLanguage();

  const options = useMemo<RubricOption[]>(() => {
    const list: RubricOption[] = [
      { label: rubricLanguage.noRubric(language.data ?? "en"), id: NO_RUBRIC },
    ];
    rubrics.data?.forEach((rubric) => {
      list.push({ label: rubric.title, id: rubric.id });
    });
    return list;
  }, [rubrics.data, language.data]);

  const selected = useMemo<RubricOption>(() => {
    return (
      options.find((option) => option.id === (value ?? NO_RUBRIC)) ?? options[0]
    );
  }, [options, value]);

  const hasRubrics = (rubrics.data?.length ?? 0) > 0;

  return (
    <label className="flex w-full flex-col">
      <span className="text-base font-medium">
        {rubricLanguage.rubricOptional(language.data ?? "en")}
      </span>
      <Dropdown<RubricOption>
        value={selected}
        disabled={disabled || rubrics.isLoading}
        loading={rubrics.isLoading}
        placeholder={rubricLanguage.selectARubric(language.data ?? "en")}
        options={options}
        optionLabel="label"
        onChange={(e: DropdownChangeEvent) => {
          const next = e.value as RubricOption | null;
          onChange(!next || next.id === NO_RUBRIC ? null : next.id);
        }}
      />
      {!rubrics.isLoading && !hasRubrics && (
        <span className="mt-1 text-xs text-gray-400">
          {rubricLanguage.pickerNoRubricsHint(language.data ?? "en")}
        </span>
      )}
    </label>
  );
}

export default RubricPicker;
