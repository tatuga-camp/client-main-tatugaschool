import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { ProgressBar } from "primereact/progressbar";
import React, { useEffect } from "react";
import { IoChevronDownSharp, IoClose } from "react-icons/io5";
import { MdAssignmentAdd } from "react-icons/md";
import Swal from "sweetalert2";
import ClassStudentAssignWork from "../../../../components/subject/ClassStudentAssignWork";
import ClassStudentWork from "../../../../components/subject/ClassStudentWork";
import ClasswordView, {
  FileClasswork,
} from "../../../../components/subject/ClasswordView";
import { menuClassworkList } from "../../../../components/subject/ClassworkCreate";
import { MenuSubject } from "../../../../data";
import useClickOutside from "../../../../hook/useClickOutside";
import useAdjustPosition from "../../../../hook/useWindow";
import {
  Assignment,
  AssignmentStatus,
  ErrorMessages,
} from "../../../../interfaces";
import {
  useCreateFileOnAssignment,
  useDeleteAssignment,
  useDeleteFileOnAssignment,
  useGetAssignment,
  useUpdateAssignment,
} from "../../../../react-query";
import {
  getSignedURLTeacherService,
  RefreshTokenService,
  UploadSignURLService,
} from "../../../../services";
import {
  convertToDateTimeLocalString,
  generateBlurHash,
  getRefetchtoken,
} from "../../../../utils";

type SummitValue = "Published" | "Save Change" | "Mark as Draft";

const menuLists = [
  {
    title: "Classwork",
    query: "classwork",
    description: "Manage the setting of your classwork here",
  },
  {
    title: "Student work",
    query: "student-work",
    description: "View and Assign student work here",
  },
  {
    title: "Manage Assigning",
    query: "manage-assigning",
    description: "Manage the assigning of student work here",
  },
] as const;
export type MenuAssignmentQuery = (typeof menuLists)[number]["query"];

function Index({
  subjectId,
  assignmentId,
}: {
  subjectId: string;
  assignmentId: string;
}) {
  const router = useRouter();
  const [triggerOption, setTriggerOption] = React.useState(false);
  const [files, setFiles] = React.useState<FileClasswork[]>([]);
  const divRef = React.useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = React.useState(false);
  const assignment = useGetAssignment({ id: assignmentId });
  const updateAssignment = useUpdateAssignment();
  const deleteFileAssignment = useDeleteFileOnAssignment();
  const createFileAssignment = useCreateFileOnAssignment();
  const deleteAssignment = useDeleteAssignment();
  const adjustedStyle = useAdjustPosition(divRef, 20); // 20px padding
  const [classwork, setClasswork] = React.useState<
    Assignment & { allowWeight: boolean }
  >();
  const [selectMenu, setSelectMenu] =
    React.useState<MenuAssignmentQuery>("classwork");
  const bodyRef = React.useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (router.isReady) {
      const menu = router.query.menu as MenuAssignmentQuery;

      if (menu) {
        setSelectMenu(menu);
      } else {
        setSelectMenu("classwork");
      }

      document.body.style.overflow = "hidden";
    }
  }, [router.isReady]);

  useEffect(() => {
    if (assignment.data) {
      setClasswork({
        ...assignment.data,
        allowWeight: assignment.data.weight === null ? false : true,
        beginDate: convertToDateTimeLocalString(
          new Date(assignment.data.beginDate)
        ),
        dueDate: assignment.data.dueDate
          ? convertToDateTimeLocalString(new Date(assignment.data.dueDate))
          : undefined,
      });
      setFiles(() => {
        return assignment.data.files?.map((file) => {
          return {
            file: null,
            type: file.type,
            data: file,
            name: file.url.split("/").pop() as string,
            url: file.url,
          };
        });
      });
    }
  }, [assignment.data]);

  useClickOutside(divRef, () => {
    setTriggerOption(false);
  });

  const handleUpdateClasswork = async (e: React.FormEvent) => {
    try {
      if (!classwork) return;
      e.preventDefault();
      setLoading(true);
      const submitter = (e.nativeEvent as SubmitEvent)
        .submitter as HTMLButtonElement;
      const summitValue = submitter.value as SummitValue;
      let status: AssignmentStatus = classwork.status;

      if (summitValue === "Published") {
        status = "Published";
      } else if (summitValue === "Mark as Draft") {
        status = "Draft";
      }

      await updateAssignment.mutateAsync({
        query: {
          assignmentId: assignmentId,
        },
        data: {
          title: classwork?.title,
          description: classwork?.description,
          maxScore: classwork?.maxScore,
          weight: classwork?.weight,
          beginDate: new Date(classwork?.beginDate).toISOString(),
          dueDate: classwork?.dueDate
            ? new Date(classwork.dueDate).toISOString()
            : null,
          status: status,
        },
      });

      setLoading(false);
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

  const handleDeleteAssignment = async () => {
    try {
      await deleteAssignment.mutateAsync({
        assignmentId: assignmentId,
      });
      router.push(`/subject/${subjectId}?menu=Classwork`);
      Swal.fire({
        title: "Success",
        text: "Assignment has been deleted",
        icon: "success",
      });
    } catch (error) {
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

  const handleDeleteFile = async (file: FileClasswork) => {
    try {
      if (!file.data) return;
      await deleteFileAssignment.mutateAsync({
        fileOnAssignmentId: file.data?.id,
      });
    } catch (error) {
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

  const handleUploadFile = async (files: FileClasswork[]) => {
    try {
      setLoading(true);
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
          schoolId: classwork?.schoolId,
        });

        await UploadSignURLService({
          contentType: file.file.type,
          file: file.file,
          signURL: signURL.signURL,
        });

        await createFileAssignment.mutateAsync({
          assignmentId: assignmentId,
          url: signURL.originalURL,
          type: file.file.type,
          size: file.file.size,
          blurHash: blurHashData,
        });
      });

      await Promise.allSettled(uploadTasks);
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
    <form
      onSubmit={selectMenu === "classwork" ? handleUpdateClasswork : undefined}
      className="flex h-full flex-col bg-background-color font-Anuphan"
    >
      <nav
        className={`w-full px-5 ${
          classwork?.status === "Published" ? "bg-white" : "bg-gray-50"
        }   border-b h-20 flex items-center justify-between`}
      >
        <section className="flex w-full items-center gap-4">
          <Link
            href={{
              pathname: `/subject/${subjectId}`,
              query: { menu: "Classwork" as MenuSubject },
            }}
            className="w-10 h-10 text-3xl border rounded-full flex items-center justify-center
       hover:bg-gray-300/50 transition active:scale-105"
          >
            <IoClose />
          </Link>

          <div
            className="w-10 h-10 text-3xl border rounded-full flex items-center justify-center
       bg-primary-color/30 text-primary-color"
          >
            <MdAssignmentAdd />
          </div>
          <h1 className="text-lg font-medium max-w-full truncate">
            {classwork?.title}
          </h1>
        </section>
        {selectMenu === "classwork" && (
          <section className="flex items-center gap-[2px]">
            {classwork?.status === "Draft" ? (
              <button
                type="submit"
                value={"Published" as SummitValue}
                className="w-40 p-2 h-10 opacity-85 hover:opacity-100 font-medium rounded-r-none rounded-md text-base text-white
     gradient-bg"
              >
                Publish
              </button>
            ) : (
              <button
                type="submit"
                value={"Save Change" as SummitValue}
                className="w-40 p-2 h-10 opacity-85 hover:opacity-100 font-medium rounded-r-none rounded-md text-base text-white
     gradient-bg"
              >
                Save Change
              </button>
            )}
            <button
              onClick={() => setTriggerOption((prev) => !prev)}
              type="button"
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
                  {menuClassworkList.map((menu, index) => {
                    const disabled =
                      (menu.title === "Mark as Draft" &&
                        classwork?.status === "Draft") ||
                      (menu.title === "Publish" &&
                        classwork?.status === "Published");
                    let summitValue: SummitValue = "Published";

                    if (menu.title === "Save Change") {
                      summitValue = "Save Change";
                    }
                    if (menu.title === "Mark as Draft") {
                      summitValue = "Mark as Draft";
                    }
                    if (menu.title === "Publish") {
                      summitValue = "Published";
                    }
                    return (
                      <button
                        onClick={() => {
                          if (menu.title === "Delete") {
                            handleDeleteAssignment();
                          }
                        }}
                        disabled={disabled}
                        type={
                          menu.title === "Publish" ||
                          menu.title === "Save Change" ||
                          menu.title === "Mark as Draft"
                            ? "submit"
                            : "button"
                        }
                        value={summitValue}
                        key={index}
                        className={`w-full p-2 flex gap-10 items-center justify-start text-base
             font-medium 
             ${
               menu.title === "Delete"
                 ? "text-red-500 hover:bg-red-500 hover:text-white"
                 : disabled
                 ? "bg-gray-200 text-white"
                 : "text-gray-500 hover:bg-primary-color hover:text-white"
             }
             `}
                      >
                        {menu.icon}
                        {menu.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}
      </nav>
      {(loading ||
        assignment.isLoading ||
        deleteFileAssignment.isPending ||
        deleteAssignment.isPending) && (
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
      )}

      <div className="w-full h-14  bg-white flex border-b justify-start items-center px-10 ">
        {menuLists
          .filter((menu) =>
            assignment.data?.type === "Material"
              ? menu.query !== "student-work"
              : true
          )
          .map((menu, index) => {
            return (
              <Link
                href={{
                  pathname: `/subject/${subjectId}/assignment/${assignmentId}`,
                  query: { menu: menu.query },
                }}
                onClick={() => setSelectMenu(menu.query)}
                key={index}
                className={`flex flex-col px-10  justify-center p-2 h-full gap-0 ${
                  selectMenu === menu.query
                    ? "bg-primary-color text-white hover:bg-primary-color"
                    : "bg-white text-black hover:bg-gray-100"
                } `}
              >
                <h1>{menu.title}</h1>
                <span
                  className={`text-xs ${
                    selectMenu === menu.query ? " text-white" : "text-gray-400"
                  } `}
                >
                  {menu.description}
                </span>
              </Link>
            );
          })}
      </div>
      <main
        ref={bodyRef}
        className={`w-full h-full max-h-screen overflow-auto`}
      >
        {selectMenu === "classwork" && (
          <ClasswordView
            classwork={classwork as Assignment}
            onChange={(d) =>
              setClasswork((prev) => {
                if (!prev) return;
                return { ...prev, ...d };
              })
            }
            files={files}
            onDeleteFile={(file) => handleDeleteFile(file)}
            onUploadFile={(file) => handleUploadFile(file)}
          />
        )}
        {selectMenu === "student-work" && (
          <ClassStudentWork
            assignmentId={assignmentId}
            onScroll={() =>
              bodyRef.current?.scrollTo({
                top: 0,
              })
            }
          />
        )}
        {selectMenu === "manage-assigning" && (
          <ClassStudentAssignWork
            assignmentId={assignmentId}
            subjectId={subjectId}
          />
        )}
      </main>
    </form>
  );
}

export default Index;
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const params = ctx.params;

    if (!params?.subjectId || !params?.assignmentId) {
      return {
        notFound: true,
      };
    }
    const { refresh_token } = getRefetchtoken(ctx);
    if (!refresh_token) {
      throw new Error("Token not found");
    }
    const accessToken = await RefreshTokenService({
      refreshToken: refresh_token,
    });

    return {
      props: {
        subjectId: params.subjectId,
        assignmentId: params.assignmentId,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/auth/sign-in",
        permanent: false,
      },
    };
  }
};
