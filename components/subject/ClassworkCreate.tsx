import React, { ReactNode, useEffect } from "react";
import { IoChevronDownSharp, IoClose, IoDuplicate } from "react-icons/io5";
import {
  MdAssignment,
  MdAssignmentAdd,
  MdDelete,
  MdOutlineDataSaverOn,
  MdOutlineFileUpload,
  MdPublish,
  MdUnpublished,
} from "react-icons/md";
import useAdjustPosition from "../../hook/useWindow";
import useClickOutside from "../../hook/useClickOutside";
import TextEditor from "../common/TextEditor";
import {
  Assignment,
  AssignmentStatus,
  AssignmentType,
  ErrorMessages,
  FileOnAssignment,
} from "../../interfaces";
import { FaBook, FaRegFile, FaRegFileImage } from "react-icons/fa6";
import Dropdown from "../common/Dropdown";
import InputNumber from "../common/InputNumber";
import Switch from "../common/Switch";
import { useCreateAssignment, useGetLanguage } from "../../react-query";
import Swal from "sweetalert2";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { convertToDateTimeLocalString, generateBlurHash } from "../../utils";
import {
  CreateFileAssignmentService,
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../services";
import ClasswordView, { FileClasswork } from "./ClasswordView";
import { useRouter } from "next/router";
import { MenuAssignmentQuery } from "../../pages/subject/[subjectId]/assignment/[assignmentId]";
import { classworkHeadMenuBarDataLanguage } from "../../data/languages";

type Props = {
  onClose: () => void;
  toast: React.RefObject<Toast>;
  subjectId: string;
  schoolId: string;
};

type TitleList =
  | "Publish"
  | "Mark as Draft"
  | "Save Change"
  | "Duplicate"
  | "Delete";

export const menuClassworkList: {
  title: TitleList;
  icon: ReactNode;
  value: string;
}[] = [
  {
    title: "Publish",
    icon: <MdPublish />,
    value: "publish",
  },
  {
    title: "Mark as Draft",
    icon: <MdUnpublished />,
    value: "markAsDraft",
  },
  {
    title: "Save Change",
    icon: <MdOutlineDataSaverOn />,
    value: "saveChange",
  },
  {
    title: "Duplicate",
    icon: <IoDuplicate />,
    value: "duplicate",
  },
  {
    title: "Delete",
    icon: <MdDelete />,
    value: "delete",
  },
];

export const classworkLists: { title: AssignmentType; icon: ReactNode }[] = [
  {
    title: "Assignment",
    icon: <MdAssignment />,
  },
  {
    title: "Material",
    icon: <FaRegFile />,
  },
];

function ClassworkCreate({ onClose, toast, subjectId, schoolId }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);
  const router = useRouter();
  const language = useGetLanguage();
  const [triggerOption, setTriggerOption] = React.useState(false);
  const [files, setFiles] = React.useState<FileClasswork[]>([]);
  const divRef = React.useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = React.useState(false);
  const adjustedStyle = useAdjustPosition(divRef, 20); // 20px padding
  const create = useCreateAssignment();
  const [classwork, setClasswork] = React.useState<{
    title?: string;
    description?: string;
    type?: AssignmentType;
    maxScore?: number;
    weight?: number | null;
    allowWeight?: boolean;
    beginDate?: string;
    deadline?: string;
  }>({
    type: "Assignment",
    beginDate: convertToDateTimeLocalString(new Date()),
  });

  useClickOutside(divRef, () => {
    setTriggerOption(false);
  });

  const handleFileChange = (files: FileClasswork[]) => {
    setFiles((prev) => {
      return [...(prev ?? []), ...files];
    });
  };
  const handleDeleteFile = async (file: FileClasswork) => {
    if (!file.data) {
      setFiles((prev) => {
        return prev?.filter((f) => f.url !== file.url);
      });
    }
  };

  const handleCreateClasswork = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const submitter = (e.nativeEvent as SubmitEvent)
        .submitter as HTMLButtonElement;
      if (
        !classwork?.title ||
        !classwork?.description ||
        !classwork?.type ||
        !classwork?.beginDate
      ) {
        throw new Error("Description is required");
      }
      setLoading(true);
      const assignment = await create.mutateAsync({
        title: classwork?.title,
        description: classwork?.description,
        type: classwork?.type,
        maxScore: classwork?.maxScore,
        weight: classwork?.weight,
        dueDate:
          classwork?.deadline && new Date(classwork.deadline).toISOString(),
        beginDate: new Date(classwork.beginDate).toISOString(),
        subjectId: subjectId,
        status: submitter.value as AssignmentStatus,
      });

      if (files?.length > 0) {
        const uploadTasks = files.map(async (file) => {
          if (!file.file) return;
          const isImage = file.type.includes("image");
          let blurHashData: string | undefined = undefined;

          if (isImage) {
            blurHashData = await generateBlurHash(file.file);
          }

          const signURL = await getSignedURLTeacherService({
            fileName: file.file.name,
            fileType: file.file.type,
            schoolId: schoolId,
            fileSize: file.file.size,
          });

          await UploadSignURLService({
            contentType: file.file.type,
            file: file.file,
            signURL: signURL.signURL,
          });

          return CreateFileAssignmentService({
            assignmentId: assignment.id,
            url: signURL.originalURL,
            type: file.file.type,
            size: file.file.size,
            blurHash: blurHashData,
          });
        });

        await Promise.allSettled(uploadTasks);
      }
      setLoading(false);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Classwork has been created",
      });
      router.push({
        pathname: `/subject/${subjectId}/assignment/${assignment.id}`,
        query: { menu: "manageassigning" as MenuAssignmentQuery },
      });
    } catch (error) {
      console.log(error);
      setLoading(false);

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
    <form onSubmit={handleCreateClasswork} className="flex flex-col">
      <nav className="w-full px-5  bg-white border-b h-20 flex items-center justify-between">
        <section className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 text-3xl border rounded-full flex items-center justify-center
           hover:bg-gray-300/50 transition active:scale-105"
          >
            <IoClose />
          </button>

          <div
            className="w-10 h-10 text-3xl border rounded-full flex items-center justify-center
           bg-primary-color/30 text-primary-color"
          >
            <MdAssignmentAdd />
          </div>
          <h1 className="text-lg font-medium">Classwork</h1>
        </section>
        <section className="flex items-center gap-[2px]">
          <button
            type="submit"
            value="Published"
            disabled={loading}
            className="w-40 p-2 h-10 opacity-85 hover:opacity-100 font-medium rounded-r-none rounded-md text-base text-white
         gradient-bg"
          >
            {classworkHeadMenuBarDataLanguage.button.publish(
              language.data ?? "en"
            )}
          </button>
          <button
            type="button"
            onClick={() => setTriggerOption((prev) => !prev)}
            className="w-max p-2 h-10  font-medium rounded-l-none rounded-md text-base text-white
         gradient-bg"
          >
            <IoChevronDownSharp />
          </button>

          {triggerOption && (
            <div
              style={{
                position: "absolute",
                ...adjustedStyle,
              }}
              ref={divRef}
            >
              <div className="w-52 h-max z-40 p-1 absolute top-8 rounded-md bg-white drop-shadow border">
                {menuClassworkList
                  .filter(
                    (i) =>
                      i.title !== "Duplicate" &&
                      i.title !== "Delete" &&
                      i.title !== "Save Change"
                  )
                  .map((menu, index) => (
                    <button
                      type={
                        menu.title === "Publish" ||
                        menu.title === "Mark as Draft"
                          ? "submit"
                          : "button"
                      }
                      value={menu.title === "Publish" ? "Published" : "Draft"}
                      key={index}
                      className={`w-full p-2 flex gap-10 items-center justify-start text-base
                 font-medium 
                 ${
                   menu.title === "Delete"
                     ? "text-red-500 hover:bg-red-500 hover:text-white"
                     : "text-gray-500 hover:bg-primary-color hover:text-white"
                 }
                 `}
                    >
                      {menu.icon}
                      {classworkHeadMenuBarDataLanguage.button[
                        menu.value as keyof typeof classworkHeadMenuBarDataLanguage.button
                      ](language.data ?? "en")}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </section>
      </nav>
      {loading && (
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
      )}
      <main className="w-full h-max max-h-screen overflow-auto flex">
        <ClasswordView
          classwork={classwork as Assignment}
          onChange={(d) => setClasswork((prev) => ({ ...prev, ...d }))}
          files={files}
          onDeleteFile={handleDeleteFile}
          onUploadFile={(file) => handleFileChange(file)}
        />
      </main>
    </form>
  );
}

export default ClassworkCreate;
