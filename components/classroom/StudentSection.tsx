import Image from "next/image";
import React, { memo } from "react";
import { LuImagePlus } from "react-icons/lu";
import {
  classroomUiLanguage,
  studentOnClassDataLanguage,
} from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { fieldInputClass, FormField } from "../common/FormField";

type StudentFields = {
  title: string;
  firstName: string;
  lastName: string;
  number: string;
  photo?: string;
  hash?: string;
};

type Props = {
  data: StudentFields;
  setData: (data: Partial<StudentFields>) => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Keeps ids unique when the create popup and edit panel both exist.
  idPrefix: string;
};

function StudentSection({ data, setData, handleUpload, idPrefix }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const labels = studentOnClassDataLanguage.createStudent;
  const id = (field: string) => `${idPrefix}-${field}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3">
        <FormField id={id("title")} label={labels.title(lang)}>
          <input
            id={id("title")}
            required
            value={data.title}
            onChange={(e) => setData({ title: e.target.value })}
            className={fieldInputClass()}
          />
        </FormField>
        <FormField id={id("number")} label={labels.number(lang)}>
          <input
            id={id("number")}
            required
            inputMode="numeric"
            value={data.number}
            onChange={(e) => setData({ number: e.target.value })}
            className={fieldInputClass()}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField id={id("firstName")} label={labels.firstName(lang)}>
          <input
            id={id("firstName")}
            required
            value={data.firstName}
            onChange={(e) => setData({ firstName: e.target.value })}
            className={fieldInputClass()}
          />
        </FormField>
        <FormField id={id("lastName")} label={labels.lastName(lang)}>
          <input
            id={id("lastName")}
            required
            value={data.lastName}
            onChange={(e) => setData({ lastName: e.target.value })}
            className={fieldInputClass()}
          />
        </FormField>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-icon-color">
          {labels.photo(lang)}
        </span>
        <div className="flex items-center gap-4">
          <span className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-background-color text-2xl text-icon-color/30 ring-1 ring-icon-color/10">
            {data.photo ? (
              <Image
                src={data.photo}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <LuImagePlus aria-hidden />
            )}
          </span>
          <div className="flex min-w-0 flex-col items-start gap-1.5">
            <label
              htmlFor={id("photo")}
              className="flex h-10 cursor-pointer items-center rounded-xl border border-icon-color/15 px-4 text-sm font-semibold text-icon-color transition-colors hover:bg-background-color focus-within:ring-4 focus-within:ring-primary-color/20"
            >
              {data.photo
                ? classroomUiLanguage.changePhoto(lang)
                : classroomUiLanguage.uploadPhoto(lang)}
              <input
                id={id("photo")}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="sr-only"
              />
            </label>
            <p className="text-sm text-icon-color/60">
              {classroomUiLanguage.photoHint(lang)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(StudentSection);
