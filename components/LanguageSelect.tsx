import Image from "next/image";
import React, { useEffect } from "react";
import { useGetLanguage, useUpdateLanguage } from "../react-query";

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

function LanguageSelect({ className }: { className?: string }) {
  const language = useGetLanguage();
  const update = useUpdateLanguage();
  const [currentLanguage, setCurrentLanguage] = React.useState<CurrentLanguage>(
    languages[0],
  );

  useEffect(() => {
    if (language.data) {
      setCurrentLanguage(
        () => languages.find((l) => l.value === language.data) ?? languages[0],
      );
    }
  }, [language.data]);

  return (
    <div
      className={`flex items-center justify-between gap-1 rounded-xl bg-gray-100 p-1 font-Anuphan ${className || "w-full"}`}
    >
      {languages.map((lang) => (
        <button
          key={lang.value}
          onClick={async () => {
            await update.mutateAsync(lang.value);
            setCurrentLanguage(lang);
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-all md:text-sm ${
            currentLanguage.value === lang.value
              ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="relative h-4 w-4 overflow-hidden rounded-full">
            <Image
              className="object-cover"
              fill
              src={lang.flag}
              alt={lang.title}
              sizes="16px"
            />
          </div>
          <span>{lang.title}</span>
        </button>
      ))}
    </div>
  );
}

export default LanguageSelect;
