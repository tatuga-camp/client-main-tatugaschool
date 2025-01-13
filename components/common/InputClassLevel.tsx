import React from "react";
import { ClassLevelList, ClassLevelType } from "../../data";

type Props = {
  value: string;
  onChange: (value: string) => void;
  required: boolean;
};
function InputClassLevel({ value, onChange, required }: Props) {
  const valueSplit = value.split("/");
  const [data, setData] = React.useState<{
    grade: ClassLevelType;
    level: string;
  }>({
    grade: ClassLevelList.some((level) => level.title === valueSplit[0])
      ? (valueSplit[0] as ClassLevelType)
      : ClassLevelList[0].title,
    level: valueSplit[1] || "1",
  });

  React.useEffect(() => {
    onChange(`${data.grade}/${data.level}`);
  }, [data]);

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">Level</label>
      <div className="flex items-center justify-between gap-2">
        <select
          value={data.grade}
          required={required}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              grade: e.target.value as ClassLevelType,
            }))
          }
          className="main-input grow"
        >
          {ClassLevelList.map((level) => {
            return <option key={level.title}>{level.title}</option>;
          })}
        </select>
        <span className="text-xl">/</span>
        <select
          required={required}
          value={data.level}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              level: e.target.value,
            }))
          }
          className="main-input w-32"
        >
          {Array.from({ length: 100 }, (_, i) => i + 1).map((level) => {
            return <option key={level}>{level}</option>;
          })}
        </select>
      </div>
    </div>
  );
}

export default InputClassLevel;
