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
  useGetLanguage,
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
import Head from "next/head";
import { classworkHeadMenuBarDataLanguage } from "../../../../data/languages";

type SummitValue = "Published" | "Save Change" | "Mark as Draft";

const menuLists = [
  {
    title: "Classwork",
    query: "classwork",
    description: "Manage the setting of your classwork here",
  },
  {
    title: "Student work",
    query: "studentwork",
    description: "View and Assign student work here",
  },
  {
    title: "Manage Assigning",
    query: "manageassigning",
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
  const language = useGetLanguage();
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
  const title = assignment.data?.title;
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
          new Date(assignment.data.beginDate),
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
          fileSize: file.file.size,
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

      await Promise.all(uploadTasks);
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
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <form
        onSubmit={
          selectMenu === "classwork" ? handleUpdateClasswork : undefined
        }
        className="flex h-full flex-col bg-background-color font-Anuphan"
      >
        <nav
          className={`w-full px-5 ${
            classwork?.status === "Published" ? "bg-white" : "bg-gray-50"
          } flex h-20 items-center justify-between border-b`}
        >
          <section className="flex w-full items-center gap-4">
            <Link
              href={{
                pathname: `/subject/${subjectId}`,
                query: { menu: "Classwork" as MenuSubject },
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border text-3xl transition hover:bg-gray-300/50 active:scale-105"
            >
              <IoClose />
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-primary-color/30 text-3xl text-primary-color">
              <MdAssignmentAdd />
            </div>
            <h1 className="max-w-full truncate text-lg font-medium">
              {classwork?.title}
            </h1>
          </section>
          {selectMenu === "classwork" && (
            <section className="flex items-center gap-[2px]">
              {classwork?.status === "Draft" ? (
                <button
                  type="submit"
                  value={"Published" as SummitValue}
                  className="gradient-bg h-10 w-max min-w-40 rounded-2xl rounded-r-none p-2 text-base font-medium text-white opacity-85 hover:opacity-100"
                >
                  {classworkHeadMenuBarDataLanguage.button.publish(
                    language.data ?? "en",
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  value={"Save Change" as SummitValue}
                  className="gradient-bg h-10 w-max min-w-40 rounded-2xl rounded-r-none p-2 text-base font-medium text-white opacity-85 hover:opacity-100"
                >
                  {classworkHeadMenuBarDataLanguage.button.saveChange(
                    language.data ?? "en",
                  )}
                </button>
              )}
              <button
                onClick={() => setTriggerOption((prev) => !prev)}
                type="button"
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
                  <div className="absolute -right-40 top-8 z-40 h-max w-60 rounded-2xl border bg-white p-1 drop-shadow">
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
                          className={`flex w-60 items-center justify-start gap-10 p-2 text-base font-medium ${
                            menu.title === "Delete"
                              ? "text-red-500 hover:bg-red-500 hover:text-white"
                              : disabled
                                ? "bg-gray-200 text-white"
                                : "text-gray-500 hover:bg-primary-color hover:text-white"
                          } `}
                        >
                          {menu.icon}
                          {classworkHeadMenuBarDataLanguage.button[
                            menu.value as keyof typeof classworkHeadMenuBarDataLanguage.button
                          ](language.data ?? "en")}
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

        <div className="flex h-14 w-full items-center justify-start border-b bg-white px-10">
          {menuLists
            .filter((menu) =>
              assignment.data?.type === "Material"
                ? menu.query !== "studentwork"
                : true,
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
                  className={`flex h-full flex-col justify-center gap-0 p-2 px-10 ${
                    selectMenu === menu.query
                      ? "bg-primary-color text-white hover:bg-primary-color"
                      : "bg-white text-black hover:bg-gray-100"
                  } `}
                >
                  <h1>
                    {classworkHeadMenuBarDataLanguage.title[
                      menu.query as keyof typeof classworkHeadMenuBarDataLanguage.title
                    ](language.data ?? "en")}
                  </h1>
                  <span
                    className={`text-xs ${
                      selectMenu === menu.query ? "text-white" : "text-gray-400"
                    } `}
                  >
                    {classworkHeadMenuBarDataLanguage.description[
                      menu.query as keyof typeof classworkHeadMenuBarDataLanguage.description
                    ](language.data ?? "en")}
                  </span>
                </Link>
              );
            })}
        </div>
      </form>
      <main
        ref={bodyRef}
        className={`h-full max-h-screen w-full overflow-auto font-Anuphan`}
      >
        {selectMenu === "classwork" && assignment?.data && (
          <ClasswordView
            skills={assignment?.data?.skills}
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
        {selectMenu === "studentwork" && (
          <ClassStudentWork
            assignmentId={assignmentId}
            onScroll={() =>
              bodyRef.current?.scrollTo({
                top: 0,
              })
            }
          />
        )}
        {selectMenu === "manageassigning" && (
          <ClassStudentAssignWork
            assignmentId={assignmentId}
            subjectId={subjectId}
          />
        )}
      </main>
    </>
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
