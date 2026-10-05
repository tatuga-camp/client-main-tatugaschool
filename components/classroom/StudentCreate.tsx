import * as crypto from "crypto";
import { Toast } from "primereact/toast";
import React, { useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import Swal from "sweetalert2";
import {
  classesDataLanguage,
  classroomUiLanguage,
  studentOnClassDataLanguage,
} from "../../data/languages";
import { useSound } from "../../hook";
import { ErrorMessages } from "../../interfaces";
import { useCreateStudent, useGetLanguage } from "../../react-query";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../services";
import { generateBlurHash } from "../../utils";
import LoadingBar from "../common/LoadingBar";
import PhotoEditor from "../common/PhotoEditor";
import StudentSection from "./StudentSection";

type Props = {
  onClose: () => void;
  classId: string;
  schoolId: string;
  toast: React.RefObject<Toast>;
  initialTab?: "single" | "excel";
};
function StudentCreate({
  onClose,
  classId,
  toast,
  schoolId,
  initialTab = "single",
}: Props) {
  const [triggerExcel, setTriggerExcel] = React.useState(
    initialTab === "excel",
  );
  const language = useGetLanguage();
  const create = useCreateStudent();
  const [loading, setLoading] = React.useState(false);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [data, setData] = React.useState<{
    title: string;
    firstName: string;
    lastName: string;
    number: string;
    photo?: string;
    hash?: string;
  }>({
    title: "",
    firstName: "",
    lastName: "",
    number: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await create.mutateAsync({
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        classId: classId,
        number: data.number,
        ...(data.photo && { photo: data.photo }),
        ...(data.hash && { hash: data.hash }),
      });
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Student created",
        life: 3000,
      });
      setData(() => {
        return {
          title: "",
          firstName: "",
          lastName: "",
          number: "",
        };
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoFile(file);
  };

  const handleSavePhoto = async (file: File) => {
    try {
      setLoading(true);

      const signURL = await getSignedURLTeacherService({
        fileName: file.name,
        fileType: file.type,
        schoolId: schoolId,
        fileSize: file.size,
      });

      await UploadSignURLService({
        file: file,
        signURL: signURL.signURL,
        contentType: file.type,
      });

      const hash = await generateBlurHash(file);

      setData((prev) => ({ ...prev, photo: signURL.originalURL, hash }));

      setPhotoFile(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex max-h-[min(90dvh,48rem)] w-[min(40rem,calc(100vw-2rem))] flex-col rounded-3xl bg-white p-5 font-Anuphan shadow-xl sm:p-6">
      {photoFile && (
        <PhotoEditor
          file={photoFile}
          onClose={() => setPhotoFile(null)}
          onSave={handleSavePhoto}
        />
      )}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-icon-color">
          {studentOnClassDataLanguage.create(language.data ?? "en")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={classroomUiLanguage.close(language.data ?? "en")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-icon-color/70 transition-colors hover:bg-background-color"
        >
          <IoMdClose aria-hidden />
        </button>
      </div>
      <div
        role="tablist"
        className="mt-4 grid grid-cols-2 rounded-xl bg-background-color p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={!triggerExcel}
          onClick={() => setTriggerExcel(false)}
          className={`h-9 rounded-lg text-sm font-semibold transition-colors ${
            !triggerExcel
              ? "bg-white text-icon-color shadow-sm"
              : "text-icon-color/60 hover:text-icon-color"
          }`}
        >
          {classroomUiLanguage.tabOneStudent(language.data ?? "en")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={triggerExcel}
          onClick={() => setTriggerExcel(true)}
          className={`flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors ${
            triggerExcel
              ? "bg-white text-icon-color shadow-sm"
              : "text-icon-color/60 hover:text-icon-color"
          }`}
        >
          <PiMicrosoftExcelLogoFill aria-hidden />
          {classroomUiLanguage.tabImportExcel(language.data ?? "en")}
        </button>
      </div>
      {triggerExcel ? (
        <div className="mt-5 min-h-0 overflow-auto">
          <CreateByExcel classId={classId} toast={toast} />
        </div>
      ) : (
        <form onSubmit={handleCreate} className="flex min-h-0 flex-1 flex-col">
          {(loading || create.isPending) && <LoadingBar />}
          <div className="mt-5 min-h-0 overflow-auto pr-1">
            <StudentSection
              idPrefix="create-student"
              data={data}
              setData={(data) => {
                setData((prev) => {
                  return {
                    ...prev,
                    ...data,
                  };
                });
              }}
              handleUpload={handleUpload}
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-icon-color/10 pt-4 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-icon-color/15 px-5 font-semibold text-icon-color transition-colors hover:bg-background-color"
            >
              {classroomUiLanguage.cancel(language.data ?? "en")}
            </button>
            <button
              type="submit"
              disabled={loading || create.isPending}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-color px-5 font-semibold text-white transition-colors hover:bg-primary-color-hover disabled:cursor-wait disabled:opacity-80"
            >
              <FiPlus aria-hidden />
              {classroomUiLanguage.addStudent(language.data ?? "en")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default StudentCreate;

type PropsCreateByExcel = {
  classId: string;
  toast: React.RefObject<Toast>;
};
function CreateByExcel({ classId, toast }: PropsCreateByExcel) {
  const language = useGetLanguage();
  const [textData, setTextData] = React.useState<string>("");
  const tableRef = React.useRef<HTMLUListElement>(null);
  const create = useCreateStudent();
  const [loading, setLoading] = React.useState(false);
  const [dataStudents, setDataStudents] = React.useState<
    {
      id: string;
      number: string;
      title: string;
      firstName: string;
      lastName: string;
    }[]
  >([]);

  useEffect(() => {
    if (textData === "") {
      setDataStudents([]);
      return;
    }
    const data = textData.split("\n").map((item) => {
      const [number, title, firstName, lastName] = item.split("\t");
      return {
        id: crypto.randomBytes(16).toString("hex"),
        number,
        title,
        firstName,
        lastName,
      };
    });

    setDataStudents(data);
  }, [textData]);

  const handleCreate = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      for (const student of dataStudents) {
        await create.mutateAsync({
          title: student.title,
          firstName: student.firstName,
          lastName: student.lastName,
          classId: classId,
          number: student.number,
        });
      }
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Student created",
        life: 3000,
      });
      setLoading(false);
      setDataStudents([]);
      setTextData("");
    } catch (error) {
      setLoading(false);
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
  return (
    <form onSubmit={handleCreate} className="mt-5">
      {loading && <LoadingBar />}
      <div className="hidden w-full grid-cols-2 gap-2 pr-8 sm:grid sm:grid-cols-5 sm:gap-0">
        <div className="text-center">
          {studentOnClassDataLanguage.createStudent.number(
            language.data ?? "en",
          )}
        </div>
        <div className="text-center">
          {studentOnClassDataLanguage.createStudent.title(
            language.data ?? "en",
          )}
        </div>
        <div className="text-center">
          {studentOnClassDataLanguage.createStudent.firstName(
            language.data ?? "en",
          )}
        </div>
        <div className="text-center">
          {studentOnClassDataLanguage.createStudent.lastName(
            language.data ?? "en",
          )}
        </div>
        <div className="text-center">Action</div>
      </div>
      {dataStudents.length > 0 ? (
        <ul ref={tableRef} className="mt-2 grid max-h-80 w-full overflow-auto">
          {dataStudents.map((item, index, array) => (
            <li
              className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-0"
              key={item.id}
            >
              <input
                type="text"
                maxLength={50}
                className="main-input"
                value={item.number}
                disabled={loading}
                name="number"
                placeholder={studentOnClassDataLanguage.createStudent.number(
                  language.data ?? "en",
                )}
                required
                onChange={(e) => {
                  setDataStudents((prev) => {
                    return prev.map((data) => {
                      if (data.id === item.id) {
                        return {
                          ...data,
                          [e.target.name]: e.target.value,
                        };
                      }
                      return data;
                    });
                  });
                }}
              />
              <input
                type="text"
                maxLength={50}
                className="main-input"
                value={item.title}
                name="title"
                disabled={loading}
                placeholder={studentOnClassDataLanguage.createStudent.title(
                  language.data ?? "en",
                )}
                required
                onChange={(e) => {
                  setDataStudents((prev) => {
                    return prev.map((data) => {
                      if (data.id === item.id) {
                        return {
                          ...data,
                          [e.target.name]: e.target.value,
                        };
                      }
                      return data;
                    });
                  });
                }}
              />
              <input
                type="text"
                maxLength={50}
                className="main-input"
                value={item.firstName}
                name="firstName"
                disabled={loading}
                placeholder={studentOnClassDataLanguage.createStudent.firstName(
                  language.data ?? "en",
                )}
                required
                onChange={(e) => {
                  setDataStudents((prev) => {
                    return prev.map((data) => {
                      if (data.id === item.id) {
                        return {
                          ...data,
                          [e.target.name]: e.target.value,
                        };
                      }
                      return data;
                    });
                  });
                }}
              />
              <input
                type="text"
                className="main-input"
                value={item.lastName}
                maxLength={50}
                required
                disabled={loading}
                name="lastName"
                placeholder={studentOnClassDataLanguage.createStudent.lastName(
                  language.data ?? "en",
                )}
                onChange={(e) => {
                  setDataStudents((prev) => {
                    return prev.map((data) => {
                      if (data.id === item.id) {
                        return {
                          ...data,
                          [e.target.name]: e.target.value,
                        };
                      }
                      return data;
                    });
                  });
                }}
              />
              <div className="flex items-center justify-start gap-2 px-5">
                <button
                  title="Delete Row"
                  type="button"
                  disabled={loading}
                  className="rounded bg-red-100 p-1 text-red-500"
                  onClick={() => {
                    setDataStudents((prev) => {
                      return prev.filter((data) => data.id !== item.id);
                    });
                  }}
                >
                  <IoMdClose />
                </button>

                {array.length - 1 === index && (
                  <button
                    title="Add Row"
                    disabled={loading}
                    type="button"
                    className="rounded bg-green-100 p-1 text-green-500"
                    onClick={() => {
                      setDataStudents((prev) => {
                        return [
                          ...prev,
                          {
                            id: crypto.randomBytes(16).toString("hex"),
                            number: "",
                            title: "",
                            firstName: "",
                            lastName: "",
                          },
                        ];
                      });

                      setTimeout(() => {
                        tableRef.current?.scrollTo({
                          top: tableRef.current.scrollHeight,
                          behavior: "smooth",
                        });
                      }, 200);
                    }}
                  >
                    <FiPlus />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <textarea
            value={textData}
            onChange={(e) => setTextData(e.target.value)}
            className="main-input mt-2 h-20 w-full resize-none"
            placeholder="Paste your excel data here"
          ></textarea>
          <span className="text-sm text-red-500">
            {studentOnClassDataLanguage.createStudent.excelDescription(
              language.data ?? "en",
            )}
          </span>
        </div>
      )}
      <div className="flex w-full justify-end gap-3 border-t pt-3">
        {dataStudents.length > 0 && (
          <button
            disabled={loading}
            type="submit"
            className="main-button flex items-center justify-center gap-1"
          >
            <FiPlus /> {classesDataLanguage.create(language.data ?? "en")}
          </button>
        )}
      </div>
    </form>
  );
}
