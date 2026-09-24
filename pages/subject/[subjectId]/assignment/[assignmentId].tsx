import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ProgressBar } from "primereact/progressbar";
import React, { useEffect, useMemo, useState } from "react";
import { IoArrowBack, IoChevronDownSharp } from "react-icons/io5";
import { MdAssignment, MdMenuBook, MdVideoLibrary } from "react-icons/md";
import Swal from "sweetalert2";
import ClassStudentAssignWork from "../../../../components/subject/ClassStudentAssignWork";
import ClassStudentWork from "../../../../components/subject/ClassStudentWork";
import { menuClassworkList } from "../../../../components/subject/ClassworkCreate";
import ClassworkExport from "../../../../components/subject/ClassworkExport";
import ClasswordView, {
  FileClasswork,
} from "../../../../components/subject/ClassworkView";
import { MenuSubject } from "../../../../data";
import {
  classworkHeadMenuBarDataLanguage,
  classworkViewDataLanguage,
} from "../../../../data/languages";
import useClickOutside from "../../../../hook/useClickOutside";
import {
  Assignment,
  AssignmentStatus,
  ErrorMessages,
  Language,
} from "../../../../interfaces";
import {
  useCreateFileOnAssignment,
  useDeleteAssignment,
  useDeleteFileOnAssignment,
  useGetAssignment,
  useGetAssignments,
  useGetLanguage,
  useGetSubject,
  useUpdateAssignment,
} from "../../../../react-query";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../../../services";
import {
  convertToDateTimeLocalString,
  generateBlurHash,
} from "../../../../utils";
import { ProgressSpinner } from "primereact/progressspinner";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import DefaultLayout from "../../../../components/layout/DefaultLayout";

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
  {
    title: "Export Classwork",
    query: "exportclasswork",
    description: "You can export this classwork to other subject here.",
  },
] as const;
export type MenuAssignmentQuery = (typeof menuLists)[number]["query"];

const typeIcon: Record<string, React.ReactNode> = {
  Assignment: <MdAssignment />,
  Material: <MdMenuBook />,
  VideoQuiz: <MdVideoLibrary />,
};

function StatusChip({
  status,
  language,
}: {
  status?: AssignmentStatus;
  language: Language;
}) {
  if (!status) return null;
  const isPublished = status === "Published";
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isPublished
          ? "bg-success-color/10 text-success-color"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {isPublished
        ? classworkViewDataLanguage.published(language)
        : classworkViewDataLanguage.draft(language)}
    </span>
  );
}

function Index({
  subjectId,
  assignmentId,
}: {
  subjectId: string;
  assignmentId: string;
}) {
  const router = useRouter();

  const subject = useGetSubject({ subjectId });
  const language = useGetLanguage();
  const [triggerOption, setTriggerOption] = React.useState(false);
  const [files, setFiles] = React.useState<FileClasswork[]>([]);
  const divRef = React.useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = React.useState(false);
  const assignment = useGetAssignment({ id: assignmentId });

  const siblingAssignments = useGetAssignments({ subjectId });

  const uniqueTags = useMemo(() => {
    const list = siblingAssignments.data ?? [];
    const map = new Map<string, string>();
    for (const a of list) {
      for (const t of a.tags ?? []) {
        const key = t.toLowerCase();
        if (!map.has(key)) map.set(key, t);
      }
    }
    return [...map.values()].sort((a, b) => a.localeCompare(b));
  }, [siblingAssignments.data]);

  const updateAssignment = useUpdateAssignment();
  const deleteFileAssignment = useDeleteFileOnAssignment();
  const createFileAssignment = useCreateFileOnAssignment();
  const deleteAssignment = useDeleteAssignment();
  const [assignmentTitle, setAssignmentTitle] = useState(
    assignment.data?.title,
  );
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
      setAssignmentTitle(assignment.data.title);
      setFiles(() => {
        return assignment.data.files?.map((file) => {
          return {
            file: null,
            type: file.type,
            data: file,
            fileOnAssignment: file,
            name: file.name ?? (file.url.split("/").pop() as string),
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
          title: assignmentTitle,
          description: classwork?.description,
          maxScore: classwork?.maxScore,
          weight: classwork?.weight,
          beginDate: new Date(classwork?.beginDate).toISOString(),
          dueDate: classwork?.dueDate
            ? new Date(classwork.dueDate).toISOString()
            : null,
          status: status,
          tags: classwork?.tags,
          rubricId: classwork?.rubricId ?? null,
          allowStudentViewScore: classwork?.allowStudentViewScore ?? true,
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

  const handleUpdateFile = (file: FileClasswork) => {
    setFiles((prev) => prev.map((f) => (f.url === file.url ? file : f)));
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
        if (file.type !== "LINK" && file.file) {
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
            name: file.name,
            type: file.file.type,
            size: file.file.size,
            blurHash: blurHashData,
          });
        }

        if (file.type === "LINK") {
          await createFileAssignment.mutateAsync({
            assignmentId: assignmentId,
            url: file.url,
            name: file.name,
            type: file.type,
            size: 1,
          });
        }
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

  if (subject.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ProgressSpinner />
      </div>
    );
  }

  if (subject.error) {
    return (
      <DefaultLayout>
        <div className="flex h-screen flex-col items-center justify-center gap-3">
          <h1 className="text-4xl text-red-500">
            {subject.error.message || "Something went wrong"}
          </h1>
          <button
            onClick={() => router.back()}
            className="w-40 rounded-2xl bg-primary-color px-4 py-2 text-white"
          >
            Back
          </button>
        </div>
      </DefaultLayout>
    );
  }
  if (!subject.data) {
    return (
      <DefaultLayout>
        <div className="flex h-screen flex-col items-center justify-center gap-3">
          <h1 className="text-4xl text-red-500">No Subject Found</h1>
          <button
            onClick={() => router.push("/")}
            className="w-40 rounded-2xl bg-primary-color px-4 py-2 text-white"
          >
            Back
          </button>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex h-dvh flex-col bg-background-color">
        <form
          onSubmit={
            selectMenu === "classwork" ? handleUpdateClasswork : undefined
          }
          className="flex shrink-0 flex-col bg-white font-Anuphan"
        >
          <nav className="relative flex min-h-16 w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-100 px-4 py-2 md:flex-nowrap md:px-6">
            <section className="flex min-w-0 flex-1 items-center gap-3">
              <Link
                href={{
                  pathname: `/subject/${subjectId}`,
                  query: { menu: "Classwork" as MenuSubject },
                }}
                aria-label="Back to classwork"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-icon-color"
              >
                <IoArrowBack />
              </Link>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-color/10 text-2xl text-primary-color">
                {typeIcon[assignment.data?.type ?? "Assignment"]}
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <input
                  aria-label="Classwork title"
                  placeholder={classworkHeadMenuBarDataLanguage.untitled(
                    language.data ?? "en",
                  )}
                  className="min-w-0 flex-1 border-b-2 border-transparent bg-transparent py-1 text-lg font-semibold text-icon-color outline-none transition focus:border-primary-color md:text-xl"
                  value={assignmentTitle ?? ""}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                />
                <div className="hidden md:block">
                  <StatusChip
                    status={classwork?.status}
                    language={language.data ?? "en"}
                  />
                </div>
              </div>
            </section>
            {selectMenu === "classwork" && (
              <section className="flex shrink-0 items-center md:relative">
                <button
                  type="submit"
                  disabled={loading}
                  value={
                    (classwork?.status === "Draft"
                      ? "Published"
                      : "Save Change") as SummitValue
                  }
                  className="flex h-10 items-center justify-center gap-2 rounded-l-xl bg-primary-color px-5 text-sm font-semibold text-white transition hover:bg-primary-color-hover disabled:opacity-60"
                >
                  {loading && <LoadingSpinner />}
                  {classwork?.status === "Draft"
                    ? classworkHeadMenuBarDataLanguage.button.publish(
                        language.data ?? "en",
                      )
                    : classworkHeadMenuBarDataLanguage.button.saveChange(
                        language.data ?? "en",
                      )}
                </button>
                <button
                  onClick={() => setTriggerOption((prev) => !prev)}
                  type="button"
                  aria-label="More actions"
                  className="flex h-10 items-center justify-center rounded-r-xl border-l border-white/20 bg-primary-color px-2.5 text-white transition hover:bg-primary-color-hover"
                >
                  <IoChevronDownSharp />
                </button>

                {triggerOption && (
                  <div
                    ref={divRef}
                    className="absolute right-4 top-full z-40 mt-1 w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white p-1.5 shadow-lg md:right-0 md:mt-2"
                  >
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
                        const isDelete = menu.title === "Delete";
                        return (
                          <React.Fragment key={index}>
                            {isDelete && (
                              <div className="my-1 border-t border-gray-100" />
                            )}
                            <button
                              onClick={() => {
                                if (isDelete) {
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
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                                isDelete
                                  ? "text-error-color hover:bg-error-color/10"
                                  : disabled
                                    ? "cursor-not-allowed text-gray-300"
                                    : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <span className="text-lg">{menu.icon}</span>
                              {classworkHeadMenuBarDataLanguage.button[
                                menu.value as keyof typeof classworkHeadMenuBarDataLanguage.button
                              ](language.data ?? "en")}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>
                )}
              </section>
            )}
          </nav>
          {(loading ||
            assignment.isLoading ||
            deleteFileAssignment.isPending ||
            deleteAssignment.isPending) && (
            <ProgressBar mode="indeterminate" style={{ height: "3px" }} />
          )}

          <div className="flex h-12 w-full items-center justify-start gap-1 overflow-x-auto border-b border-gray-100 bg-white px-4 md:h-14 md:px-6">
            {menuLists
              .filter((menu) =>
                assignment.data?.type === "Material"
                  ? menu.query !== "studentwork"
                  : true,
              )
              .map((menu, index) => {
                const active = selectMenu === menu.query;
                return (
                  <Link
                    href={{
                      pathname: `/subject/${subjectId}/assignment/${assignmentId}`,
                      query: { menu: menu.query },
                    }}
                    onClick={() => setSelectMenu(menu.query)}
                    key={index}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-full shrink-0 flex-col justify-center border-b-2 px-3 transition md:px-4 ${
                      active
                        ? "border-primary-color text-primary-color"
                        : "border-transparent text-gray-500 hover:text-icon-color"
                    }`}
                  >
                    <span className="whitespace-nowrap text-sm font-semibold">
                      {classworkHeadMenuBarDataLanguage.title[
                        menu.query as keyof typeof classworkHeadMenuBarDataLanguage.title
                      ](language.data ?? "en")}
                    </span>
                    <span className="hidden whitespace-nowrap text-xs text-gray-400 md:block">
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
          className={`min-h-0 w-full flex-1 overflow-auto font-Anuphan`}
        >
          {selectMenu === "classwork" && assignment.data && classwork && (
            <ClasswordView
              skills={assignment?.data?.skills}
              classwork={classwork}
              uniqueTags={uniqueTags}
              onChange={(d) =>
                setClasswork((prev) => {
                  if (!prev) return;
                  return { ...prev, ...d };
                })
              }
              subjectId={subjectId}
              schoolId={assignment.data?.schoolId}
              files={files}
              onDeleteFile={(file) => handleDeleteFile(file)}
              onUploadFile={(file) => handleUploadFile(file)}
              onUpdateFile={(file) => handleUpdateFile(file)}
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
          {selectMenu === "exportclasswork" && assignment.data && (
            <ClassworkExport
              assignment={assignment.data}
              files={assignment.data.files}
              schoolId={assignment.data.schoolId}
              currentSubjectId={subjectId}
            />
          )}
        </main>
      </div>
    </>
  );
}

export default Index;
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const params = ctx.params;

  if (!params?.subjectId || !params?.assignmentId) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      subjectId: params.subjectId,
      assignmentId: params.assignmentId,
    },
  };
};
