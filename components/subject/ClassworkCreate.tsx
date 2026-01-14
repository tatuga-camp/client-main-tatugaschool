import { useRouter } from "next/router";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import React, { ReactNode, useEffect } from "react";
import { FaRegFile } from "react-icons/fa6";
import { IoChevronDownSharp, IoClose } from "react-icons/io5";
import {
  MdAssignment,
  MdAssignmentAdd,
  MdDelete,
  MdOutlineDataSaverOn,
  MdPublish,
  MdUnpublished,
} from "react-icons/md";
import Swal from "sweetalert2";
import { classworkHeadMenuBarDataLanguage } from "../../data/languages";
import useClickOutside from "../../hook/useClickOutside";
import useAdjustPosition from "../../hook/useWindow";
import {
  Assignment,
  AssignmentStatus,
  AssignmentType,
  ErrorMessages,
} from "../../interfaces";
import { MenuAssignmentQuery } from "../../pages/subject/[subjectId]/assignment/[assignmentId]";
import { useCreateAssignment, useGetLanguage } from "../../react-query";
import {
  CreateFileAssignmentService,
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../services";
import { convertToDateTimeLocalString, generateBlurHash } from "../../utils";
import ClasswordView, { FileClasswork } from "./ClassworkView";

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
    dueDate?: string;
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
        ...(classwork.dueDate && {
          dueDate: new Date(classwork.dueDate).toISOString(),
        }),
        beginDate: new Date(classwork.beginDate).toISOString(),
        subjectId: subjectId,
        status: submitter.value as AssignmentStatus,
      });

      if (files?.length > 0) {
        const uploadTasks = files.map(async (file) => {
          if (file.type !== "LINK" && file.file) {
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
          }

          if (file.type === "LINK") {
            return CreateFileAssignmentService({
              assignmentId: assignment.id,
              url: file.url,
              type: file.type,
              size: 1,
            });
          }
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
      <nav className="flex h-20 w-full items-center justify-between border-b bg-white px-5">
        <section className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border text-3xl transition hover:bg-gray-300/50 active:scale-105"
          >
            <IoClose />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-primary-color/30 text-3xl text-primary-color">
            <MdAssignmentAdd />
          </div>
          <h1 className="text-lg font-medium">Classwork</h1>
        </section>
        <section className="flex items-center gap-[2px]">
          <button
            type="submit"
            value="Published"
            disabled={loading}
            className="gradient-bg h-10 w-40 rounded-2xl rounded-r-none p-2 text-base font-medium text-white opacity-85 hover:opacity-100"
          >
            {classworkHeadMenuBarDataLanguage.button.publish(
              language.data ?? "en",
            )}
          </button>
          <button
            type="button"
            onClick={() => setTriggerOption((prev) => !prev)}
            className="gradient-bg h-10 w-max rounded-2xl rounded-l-none p-2 text-base font-medium text-white"
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
              <div className="absolute top-8 z-40 h-max w-52 rounded-2xl border bg-white p-1 drop-shadow">
                {menuClassworkList
                  .filter(
                    (i) =>
                      i.title !== "Duplicate" &&
                      i.title !== "Delete" &&
                      i.title !== "Save Change",
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
                      className={`flex w-full items-center justify-start gap-10 p-2 text-base font-medium ${
                        menu.title === "Delete"
                          ? "text-red-500 hover:bg-red-500 hover:text-white"
                          : "text-gray-500 hover:bg-primary-color hover:text-white"
                      } `}
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
      <main className="flex h-max max-h-screen w-full overflow-auto">
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
