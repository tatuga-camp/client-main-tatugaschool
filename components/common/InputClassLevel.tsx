import React from "react";
import { ClassLevelList, ClassLevelType } from "../../data";
import { useGetLanguage } from "../../react-query";

type Props = {
  value: string;
  onChange: (value: string) => void;
  required: boolean;
  title?: string;
};

function InputClassLevel({ value, onChange, required, title }: Props) {
  const language = useGetLanguage();
  const valueSplit = value.split("/");

  const isPredefined = ClassLevelList.some(
    (level) => level.title === valueSplit[0],
  );
  const initialGrade = isPredefined
    ? (valueSplit[0] as ClassLevelType)
    : valueSplit[0] || ClassLevelList[0].title;
  const initialIsCustom = !isPredefined && !!valueSplit[0];

  const [data, setData] = React.useState<{
    grade: string;
    level: string;
  }>({
    grade: initialGrade,
    level: valueSplit[1] || "1",
  });

  const [isCustom, setIsCustom] = React.useState(initialIsCustom);

  React.useEffect(() => {
    onChange(`${data.grade}/${data.level}`);
  }, [data]);

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {title ? title : language.data === "th" ? "ระดับชั้น" : "Level"}
      </label>
      <div className="flex items-center justify-between gap-2">
        {isCustom ? (
          <div className="flex grow items-center gap-2">
            <input
              value={data.grade}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  grade: e.target.value,
                }))
              }
              className="main-input grow"
              placeholder={
                language.data === "th" ? "ระบุระดับชั้น" : "Enter grade level"
              }
              required={required}
            />
            <button
              type="button"
              onClick={() => {
                setIsCustom(false);
                setData((prev) => ({
                  ...prev,
                  grade: ClassLevelList[0].title,
                }));
              }}
              className="whitespace-nowrap text-xs text-red-500 hover:underline"
            >
              {language.data === "th" ? "เลือกจากรายการ" : "Select from list"}
            </button>
          </div>
        ) : (
          <select
            value={data.grade}
            required={required}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "OTHER_CUSTOM_OPTION") {
                setIsCustom(true);
                setData((prev) => ({
                  ...prev,
                  grade: "",
                }));
              } else {
                setData((prev) => ({
                  ...prev,
                  grade: val,
                }));
              }
            }}
            className="main-input grow"
          >
            {ClassLevelList.map((level) => {
              return (
                <option key={level.title} value={level.title}>
                  {language.data === "th" ? level.title : level.titleEn}
                </option>
              );
            })}
            <option value="OTHER_CUSTOM_OPTION">
              {language.data === "th" ? "อื่นๆ" : "Other"}
            </option>
          </select>
        )}
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
