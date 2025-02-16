import React, { useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import InputWithIcon from "../common/InputWithIcon";
import { MdFamilyRestroom, MdOutlineSubtitles } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { TbNumber123 } from "react-icons/tb";
import { FiPlus } from "react-icons/fi";
import { useCreateStudent } from "../../react-query";
import { ErrorMessages } from "../../interfaces";
import Swal from "sweetalert2";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../services";
import Image from "next/image";
import LoadingSpinner from "../common/LoadingSpinner";
import LoadingBar from "../common/LoadingBar";
import { generateBlurHash } from "../../utils";
import { useSound } from "../../hook";
import { Toast } from "primereact/toast";
import StudentSection from "./StudentSection";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import * as crypto from "crypto";

type Props = {
  onClose: () => void;
  classId: string;
  schoolId: string;
  toast: React.RefObject<Toast>;
};
function StudentCreate({ onClose, classId, toast, schoolId }: Props) {
  const [triggerExcel, setTriggerExcel] = React.useState(false);
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
    <div className="lg:w-5/12 2xl:w-4/12 h-[35rem] bg-white rounded-md p-4 border">
      <div className="w-full pb-3 border-b items-center justify-between flex">
        <h1 className="text-lg font-semibold">Create Student</h1>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setTriggerExcel((prev) => !prev)}
            type="button"
            className="second-button w-40 border"
          >
            {triggerExcel ? (
              "UNDO"
            ) : (
              <div className="flex items-center justify-center gap-1">
                <PiMicrosoftExcelLogoFill />
                Add by Excel
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-lg hover:bg-gray-300/50 w-6 h-6 rounded flex items-center justify-center font-semibold"
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
          <div className="w-full h-96 overflow-auto p-3">
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
          <div className="w-full pt-3 border-t  justify-end gap-3 flex">
            <button
              type="button"
              onClick={onClose}
              className="second-button border flex items-center justify-center gap-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="main-button flex items-center justify-center gap-1"
            >
              <FiPlus /> Create student
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
      <div className="w-full grid grid-cols-5 pr-8">
        <div className="text-center">Number</div>
        <div className="text-center">Title</div>
        <div className="text-center">First Name</div>
        <div className="text-center">Last Name</div>
        <div className="text-center">Action</div>
      </div>
      {dataStudents.length > 0 ? (
        <ul
          ref={tableRef}
          className="w-full grid max-h-80 mt-2 overflow-auto  "
        >
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
              <div className="flex items-center gap-2 justify-start px-5">
                <button
                  title="Delete Row"
                  type="button"
                  disabled={loading}
                  className="text-red-500 bg-red-100 p-1 rounded"
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
                    className="text-green-500 bg-green-100 p-1 rounded"
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
            className="w-full h-20 mt-2 main-input resize-none"
            placeholder="Paste your excel data here"
          ></textarea>
          <span className="text-sm text-red-500">
            **Please make sure the data is in the correct format. The data must
            be in the following format: Number, Title, First Name, Last Name.
          </span>
        </div>
      )}
      <div className="w-full pt-3 border-t  justify-end gap-3 flex">
        <button
          disabled={loading}
          type="button"
          className="second-button border flex items-center justify-center gap-1"
        >
          Cancel
        </button>
        {dataStudents.length > 0 && (
          <button
            disabled={loading}
            type="submit"
            className="main-button flex items-center justify-center gap-1"
          >
            <FiPlus /> Create student
          </button>
        )}
      </div>
    </form>
  );
}
