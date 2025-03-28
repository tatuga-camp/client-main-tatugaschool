import React, { memo } from "react";
import InputWithIcon from "../common/InputWithIcon";
import { MdFamilyRestroom, MdOutlineSubtitles } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { TbNumber123 } from "react-icons/tb";
import Image from "next/image";
import { useGetLanguage } from "../../react-query";
import { studentOnClassDataLanguage } from "../../data/languages";

type Props = {
  data: {
    title: string;
    firstName: string;
    lastName: string;
    number: string;
    photo?: string;
    hash?: string;
  };
  setData: (data: {
    title?: string;
    firstName?: string;
    lastName?: string;
    number?: string;
    photo?: string;
    hash?: string;
  }) => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
function StudentSection({ data, setData, handleUpload }: Props) {
  const language = useGetLanguage();
  return (
    <>
      <h1 className="text-lg py-5 font-medium">Student Information</h1>
      <div className="flex flex-col gap-5">
        <InputWithIcon
          required
          value={data?.title}
          title={studentOnClassDataLanguage.createStudent.title(
            language.data ?? "en"
          )}
          minLength={1}
          placeholder={studentOnClassDataLanguage.createStudent.title(
            language.data ?? "en"
          )}
          onChange={(value) => {
            setData({ title: value });
          }}
          icon={<MdOutlineSubtitles />}
        />
        <div className="flex gap-1 w-full">
          <InputWithIcon
            value={data?.firstName}
            required
            title={studentOnClassDataLanguage.createStudent.firstName(
              language.data ?? "en"
            )}
            minLength={1}
            placeholder={studentOnClassDataLanguage.createStudent.firstName(
              language.data ?? "en"
            )}
            onChange={(value) => {
              setData({ firstName: value });
            }}
            icon={<IoPerson />}
          />
          <InputWithIcon
            value={data?.lastName}
            required
            title={studentOnClassDataLanguage.createStudent.lastName(
              language.data ?? "en"
            )}
            minLength={1}
            placeholder={studentOnClassDataLanguage.createStudent.lastName(
              language.data ?? "en"
            )}
            onChange={(value) => {
              setData({ lastName: value });
            }}
            icon={<MdFamilyRestroom />}
          />
        </div>
        <InputWithIcon
          value={data?.number}
          required
          title={studentOnClassDataLanguage.createStudent.number(
            language.data ?? "en"
          )}
          placeholder={studentOnClassDataLanguage.createStudent.number(
            language.data ?? "en"
          )}
          minLength={1}
          onChange={(value) => {
            setData({ number: value });
          }}
          icon={<TbNumber123 />}
        />
      </div>
      <div className="text-sm mt-10 mb-2">
        {studentOnClassDataLanguage.createStudent.photo(language.data ?? "en")}
      </div>
      <label
        htmlFor="dropzone-file"
        className={`flex flex-col relative items-center justify-center w-full h-64 border-2
                 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50
                `}
      >
        {data.photo ? (
          <div className="w-full h-full relative">
            <Image
              src={data.photo}
              alt="student"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 "
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 ">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 ">
              PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
        )}

        <input
          onChange={handleUpload}
          accept="image/*"
          id="dropzone-file"
          type="file"
          className="hidden"
        />
      </label>
    </>
  );
}

export default memo(StudentSection);
