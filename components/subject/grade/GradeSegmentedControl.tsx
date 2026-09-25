import React from "react";

export const SECONDARY_BUTTON =
  "flex w-max items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-icon-color transition-colors hover:bg-background-color disabled:opacity-50";

type Option<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

function GradeSegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-background-color p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`flex items-center gap-1 rounded-xl px-3 py-1 text-sm font-semibold transition-colors ${
            value === option.value
              ? "bg-primary-color text-white"
              : "text-icon-color hover:bg-gray-200"
          }`}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default GradeSegmentedControl;
