import { DropdownChangeEvent } from "primereact/dropdown";
import React, { useMemo } from "react";
import { useGetRubricsBySubject } from "../../../react-query";
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

  const options = useMemo<RubricOption[]>(() => {
    const list: RubricOption[] = [{ label: "No rubric", id: NO_RUBRIC }];
    rubrics.data?.forEach((rubric) => {
      list.push({ label: rubric.title, id: rubric.id });
    });
    return list;
  }, [rubrics.data]);

  const selected = useMemo<RubricOption>(() => {
    return (
      options.find((option) => option.id === (value ?? NO_RUBRIC)) ?? options[0]
    );
  }, [options, value]);

  const hasRubrics = (rubrics.data?.length ?? 0) > 0;

  return (
    <label className="flex w-full flex-col">
      <span className="text-base font-medium">Rubric (optional)</span>
      <Dropdown<RubricOption>
        value={selected}
        disabled={disabled || rubrics.isLoading}
        loading={rubrics.isLoading}
        placeholder="Select a rubric"
        options={options}
        optionLabel="label"
        onChange={(e: DropdownChangeEvent) => {
          const next = e.value as RubricOption | null;
          onChange(!next || next.id === NO_RUBRIC ? null : next.id);
        }}
      />
      {!rubrics.isLoading && !hasRubrics && (
        <span className="mt-1 text-xs text-gray-400">
          No rubrics yet. Create one in Settings to attach it here.
        </span>
      )}
    </label>
  );
}

export default RubricPicker;
