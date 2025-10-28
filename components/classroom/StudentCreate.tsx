import * as crypto from "crypto";
import { Toast } from "primereact/toast";
import React, { useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import Swal from "sweetalert2";
import {
  classesDataLanguage,
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
import StudentSection from "./StudentSection";

type Props = {
  onClose: () => void;
  classId: string;
  schoolId: string;
  toast: React.RefObject<Toast>;
};
function StudentCreate({ onClose, classId, toast, schoolId }: Props) {
  const [triggerExcel, setTriggerExcel] = React.useState(false);
  const language = useGetLanguage();
  const create = useCreateStudent();
  const sound = useSound("/sounds/ding.mp3") as HTMLAudioElement;
  const [loading, setLoading] = React.useState(false);
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
      sound.play();
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = e.target.files?.[0];
      if (!file) {
        throw new Error("File not found");
      }

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
    <div className="h-[35rem] w-full rounded-2xl border bg-white p-4 md:w-10/12 lg:w-7/12 2xl:w-4/12">
      <div className="flex w-full items-center justify-between border-b pb-3">
        <h1 className="text-lg font-semibold">
          {studentOnClassDataLanguage.create(language.data ?? "en")}
        </h1>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setTriggerExcel((prev) => !prev)}
            type="button"
            className="second-button w-60 border"
          >
            {triggerExcel ? (
              studentOnClassDataLanguage.createStudent.cancel(
                language.data ?? "en",
              )
            ) : (
              <div className="flex items-center justify-center gap-1">
                <PiMicrosoftExcelLogoFill />
                {studentOnClassDataLanguage.createStudent.excel(
                  language.data ?? "en",
                )}
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
          >
            <IoMdClose />
          </button>
        </div>
      </div>
      {triggerExcel ? (
        <CreateByExcel classId={classId} toast={toast} />
      ) : (
        <form onSubmit={handleCreate}>
          {(loading || create.isPending) && <LoadingBar />}
          <div className="h-96 w-full overflow-auto p-3">
            <StudentSection
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
          <div className="flex w-full justify-end gap-3 border-t pt-3">
            <button
              type="button"
              onClick={onClose}
              className="second-button flex items-center justify-center gap-1 border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="main-button flex items-center justify-center gap-1"
            >
              <FiPlus />{" "}
              {studentOnClassDataLanguage.create(language.data ?? "en")}
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
  const sound = useSound("/sounds/ding.mp3") as HTMLAudioElement;
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
      sound.play();
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
      <div className="grid w-full grid-cols-5 pr-8">
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
            <li className="grid grid-cols-5" key={item.id}>
              <input
                type="text"
                maxLength={50}
                className="main-input"
                value={item.number}
                disabled={loading}
                name="number"
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
