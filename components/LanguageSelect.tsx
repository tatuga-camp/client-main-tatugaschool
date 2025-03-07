import Image from "next/image";
import React, { useEffect } from "react";
import { useGetLanguage, useUpdateLanguage } from "../react-query";
import Dropdown from "./common/Dropdown";

const languages = [
  {
    title: "English",
    flag: "/svg/flags/1x1/gb.svg",
    value: "en",
  },
  {
    title: "ไทย",
    flag: "/svg/flags/1x1/th.svg",
    value: "th",
  },
] as const;

type CurrentLanguage = (typeof languages)[number];

function LanguageSelect() {
  const language = useGetLanguage();
  const update = useUpdateLanguage();
  const [currentLanguage, setCurrentLanguage] = React.useState<CurrentLanguage>(
    {
      title: "English",
      flag: "/svg/flags/1x1/gb.svg",
      value: "en",
    }
  );

  useEffect(() => {
    if (language.data) {
      setCurrentLanguage(
        () => languages.find((l) => l.value === language.data) ?? languages[0]
      );
    }
  }, [language.data]);

  return (
    <div className="w-40 font-Anuphan">
      <Dropdown<CurrentLanguage>
        onChange={async (e) => {
          await update.mutateAsync(e.value);
          setCurrentLanguage(
            languages.find((l) => l.value === e.value) ?? languages[0]
          );
        }}
        value={currentLanguage.value}
        options={[...languages]}
        placeholder="Select Language"
        valueTemplate={(item) => {
          if (!item) {
            return "Select Language";
          }
          return (
            <div className="flex items-center justify-start gap-2">
              <div className="w-5 h-5 relative">
                <Image
                  className="object-contain"
                  fill
                  src={item?.flag}
                  alt={item?.title}
                  layout="fill"
                />
              </div>
              {item?.title}
            </div>
          );
        }}
        itemTemplate={(item) => {
          return (
            <div className="flex items-center justify-start gap-2">
              <div className="w-5 h-5 relative">
                <Image
                  className="object-contain"
                  fill
                  src={item?.flag}
                  alt={item?.title}
                  layout="fill"
                />
              </div>
              {item?.title}
            </div>
          );
        }}
      />
    </div>
  );
}

export default LanguageSelect;
