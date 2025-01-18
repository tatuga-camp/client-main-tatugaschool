import React from "react";
import { EducationYear } from "../../interfaces";

type Props = {
  value: EducationYear;
  onChange: (value: string) => void;
  required: boolean;
};
function InputEducationYear({ value, onChange, required }: Props) {
  const valueSplit = value.split("/");
  const [data, setData] = React.useState<{
    term: string;
    year: string;
  }>({
    term: valueSplit[0] || "1",
    year: valueSplit[1] || new Date().getFullYear().toString(),
  });

  React.useEffect(() => {
    onChange(`${data.term}/${data.year}`);
  }, [data]);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <select
          value={data.term}
          required={required}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              term: e.target.value as string,
            }))
          }
          className="main-input grow"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((level, index) => {
            return (
              <option value={level} key={level}>
                {level}
              </option>
            );
          })}
        </select>
        <span className="text-xl">/</span>
        <select
          required={required}
          value={data.year}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              year: e.target.value,
            }))
          }
          className="main-input w-32"
        >
          {Array.from({ length: 21 }, (_, i) => {
            const currentYear = new Date().getFullYear();
            return currentYear - 10 + i; // Generate years from 10 years before to 10 years after
          }).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default InputEducationYear;
