import { Toast } from "primereact/toast";
import React, { useMemo, useRef, useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { MdDelete, MdEdit, MdOutlinePassword } from "react-icons/md";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { SiGooglegemini } from "react-icons/si";
import Swal from "sweetalert2";
import { SortByOption, sortByOptions } from "../../data";
import {
  classroomUiLanguage,
  sortByOptionsDataLanguage,
} from "../../data/languages";
import { Classroom, ErrorMessages, Student } from "../../interfaces";
import {
  useDeleteStudent,
  useGetLanguage,
  useResetStudentPassword,
  useUpdateStudent,
} from "../../react-query";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../services";
import { generateBlurHash } from "../../utils";
import { filterStudents, sortStudents } from "../../utils/studentRoster";
import ConfirmDeleteMessage from "../common/ConfirmDeleteMessage";
import { fieldInputClass } from "../common/FormField";
import PhotoEditor from "../common/PhotoEditor";
import { RowAction } from "../common/RowActionsMenu";
import PopupLayout from "../layout/PopupLayout";
import SlideLayout from "../layout/SlideLayout";
import StudentCareerSuggest from "../student/StudentCareerSuggest";
import StudentCreate from "./StudentCreate";
import StudentDetailsPanel from "./StudentDetailsPanel";
import StudentRosterRow from "./StudentRosterRow";

type Props = {
  students: Student[];
  classroom: Classroom;
};
type PanelView = "details" | "career";

const showError = (error: unknown) => {
  console.log(error);
  const result = error as ErrorMessages | undefined;
  Swal.fire({
    title: result?.error ? result.error : "Something Went Wrong",
    text: result?.message?.toString(),
    footer: result?.statusCode
      ? "Code Error: " + result.statusCode.toString()
      : "",
    icon: "error",
  });
};

const panelClass =
  "rounded-2xl bg-white shadow-[0_12px_24px_rgba(145,158,171,0.12)]";

function StudentLists({ students, classroom }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const resetPassword = useResetStudentPassword();
  const deleteStudent = useDeleteStudent();
  const updateStudent = useUpdateStudent();
  const toast = useRef<Toast>(null);
  const [createTab, setCreateTab] = useState<"single" | "excel" | null>(null);
  const [selectStudent, setSelectStudent] = useState<Student | null>(null);
  const [panelView, setPanelView] = useState<PanelView>("details");
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [busyStudentId, setBusyStudentId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [sortBy, setSortBy] = useState<SortByOption>("Default");
  const [search, setSearch] = useState("");

  const visibleStudents = useMemo(
    () => filterStudents(sortStudents(students, sortBy), search),
    [students, sortBy, search],
  );

  const openStudent = (student: Student, view: PanelView = "details") => {
    setPanelView(view);
    setSelectStudent(student);
  };
  const closePanel = () => {
    setSelectStudent(null);
    setPanelView("details");
  };
  const openCreate = (tab: "single" | "excel") => {
    document.body.style.overflow = "hidden";
    setCreateTab(tab);
  };
  const closeCreate = () => {
    document.body.style.overflow = "auto";
    setCreateTab(null);
  };

  const handleUpdateStudent = async () => {
    if (!selectStudent) return;
    try {
      // A photo without a blur hash is a stale URL from before an upload
      // finished; don't send it.
      const photo =
        selectStudent.photo && selectStudent.blurHash
          ? selectStudent.photo
          : undefined;
      await updateStudent.mutateAsync({
        query: { studentId: selectStudent.id },
        body: {
          ...(selectStudent.title && { title: selectStudent.title }),
          ...(selectStudent.firstName && { firstName: selectStudent.firstName }),
          ...(selectStudent.lastName && { lastName: selectStudent.lastName }),
          ...(photo && { photo }),
          ...(selectStudent.blurHash && { blurHash: selectStudent.blurHash }),
          ...(selectStudent.number && { number: selectStudent.number }),
        },
      });
      toast.current?.show({
        severity: "success",
        summary: classroomUiLanguage.saved(lang),
        life: 3000,
      });
    } catch (error) {
      showError(error);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoFile(file);
  };

  const handleSavePhoto = async (file: File) => {
    if (!selectStudent) return;
    try {
      setLoadingStudent(true);
      const signURL = await getSignedURLTeacherService({
        fileName: file.name,
        fileType: file.type,
        schoolId: classroom.schoolId,
        fileSize: file.size,
      });
      await UploadSignURLService({
        file,
        signURL: signURL.signURL,
        contentType: file.type,
      });
      const hash = await generateBlurHash(file);
      setSelectStudent((prev) =>
        prev ? { ...prev, photo: signURL.originalURL, blurHash: hash } : null,
      );
      await updateStudent.mutateAsync({
        query: { studentId: selectStudent.id },
        body: { photo: signURL.originalURL, blurHash: hash },
      });
      setPhotoFile(null);
    } catch (error) {
      showError(error);
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    try {
      setBusyStudentId(student.id);
      await deleteStudent.mutateAsync({ studentId: student.id });
      toast.current?.show({
        severity: "success",
        summary: classroomUiLanguage.studentDeleted(lang),
        life: 3000,
      });
      if (selectStudent?.id === student.id) closePanel();
    } catch (error) {
      showError(error);
    } finally {
      setBusyStudentId(null);
    }
  };

  const confirmDelete = (student: Student) => {
    document.body.style.overflow = "auto";
    ConfirmDeleteMessage({
      language: lang,
      callback: async () => {
        await handleDeleteStudent(student);
      },
    });
  };

  const confirmResetPassword = async (student: Student) => {
    const name = student.firstName;
    const { isConfirmed } = await Swal.fire({
      title: classroomUiLanguage.resetConfirmTitle(lang, name),
      text: classroomUiLanguage.resetConfirmBody(lang, name),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: classroomUiLanguage.resetPassword(lang),
      cancelButtonText: classroomUiLanguage.cancel(lang),
      confirmButtonColor: "#2C7CD1",
    });
    if (!isConfirmed) return;
    try {
      setBusyStudentId(student.id);
      await resetPassword.mutateAsync({ studentId: student.id });
      toast.current?.show({
        severity: "success",
        summary: classroomUiLanguage.resetDone(lang, name),
        life: 3000,
      });
    } catch (error) {
      showError(error);
    } finally {
      setBusyStudentId(null);
    }
  };

  const rowActions = (student: Student): RowAction[] => [
    {
      key: "reset",
      label: classroomUiLanguage.resetPassword(lang),
      icon: <MdOutlinePassword />,
      onSelect: () => confirmResetPassword(student),
    },
    {
      key: "career",
      label: classroomUiLanguage.careerSuggestion(lang),
      icon: <SiGooglegemini />,
      onSelect: () => openStudent(student, "career"),
    },
    {
      key: "edit",
      label: classroomUiLanguage.editDetails(lang),
      icon: <MdEdit />,
      onSelect: () => openStudent(student),
    },
    {
      key: "delete",
      label: classroomUiLanguage.deleteStudent(lang),
      icon: <MdDelete />,
      danger: true,
      onSelect: () => confirmDelete(student),
    },
  ];

  const addButtons = (
    <div className="grid grid-cols-2 gap-2 sm:flex">
      <button
        type="button"
        onClick={() => openCreate("excel")}
        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-icon-color/15 bg-white px-4 text-sm font-semibold text-icon-color transition-colors hover:bg-background-color focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/20"
      >
        <PiMicrosoftExcelLogoFill aria-hidden className="text-lg" />
        {classroomUiLanguage.importExcel(lang)}
      </button>
      <button
        type="button"
        onClick={() => openCreate("single")}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-color px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-color-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/30"
      >
        <FiPlus aria-hidden />
        {classroomUiLanguage.addStudent(lang)}
      </button>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      {photoFile && (
        <PhotoEditor
          file={photoFile}
          onClose={() => setPhotoFile(null)}
          onSave={handleSavePhoto}
        />
      )}
      {selectStudent && (
        <SlideLayout
          loading={loadingStudent || updateStudent.isPending}
          onClose={closePanel}
        >
          {panelView === "career" ? (
            <StudentCareerSuggest
              studentId={selectStudent.id}
              studentName={selectStudent.firstName}
              onClose={() => setPanelView("details")}
            />
          ) : (
            <StudentDetailsPanel
              student={selectStudent}
              onChange={(data) =>
                setSelectStudent((prev) => (prev ? { ...prev, ...data } : null))
              }
              onUpload={handleUpload}
              onResetPassword={() => confirmResetPassword(selectStudent)}
              resetting={busyStudentId === selectStudent.id}
              onOpenCareer={() => setPanelView("career")}
              onDelete={() => confirmDelete(selectStudent)}
              onCancel={closePanel}
              onSave={handleUpdateStudent}
              saving={updateStudent.isPending}
            />
          )}
        </SlideLayout>
      )}
      {createTab && (
        <PopupLayout onClose={closeCreate}>
          <StudentCreate
            initialTab={createTab}
            schoolId={classroom.schoolId}
            toast={toast}
            classId={classroom.id}
            onClose={closeCreate}
          />
        </PopupLayout>
      )}

      <section className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-icon-color">
            {classroomUiLanguage.studentsHeading(lang, students.length)}
          </h2>
          {addButtons}
        </div>

        {/* Sticky under the 5rem navbar on phones so search stays reachable. */}
        <div className="sticky top-20 z-20 -mx-4 flex gap-2 bg-background-color/95 px-4 py-2 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">
              {classroomUiLanguage.searchPlaceholder(lang)}
            </span>
            <FiSearch
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-icon-color/40"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={classroomUiLanguage.searchPlaceholder(lang)}
              className={`${fieldInputClass()} pl-11`}
            />
          </label>
          <label className="w-32 shrink-0 sm:w-44">
            <span className="sr-only">{classroomUiLanguage.sortLabel(lang)}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortByOption)}
              className={`${fieldInputClass()} cursor-pointer text-sm`}
            >
              {sortByOptions.map((option) => (
                <option key={option.title} value={option.title}>
                  {sortByOptionsDataLanguage[
                    option.title.toLowerCase() as keyof typeof sortByOptionsDataLanguage
                  ](lang)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {students.length === 0 ? (
          <div className={`${panelClass} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
            <p className="text-lg font-semibold text-icon-color">
              {classroomUiLanguage.emptyRosterTitle(lang)}
            </p>
            <p className="max-w-sm text-sm text-icon-color/70">
              {classroomUiLanguage.emptyRosterBody(lang)}
            </p>
            {addButtons}
          </div>
        ) : visibleStudents.length === 0 ? (
          <p className={`${panelClass} px-6 py-10 text-center text-icon-color/70`}>
            {classroomUiLanguage.noSearchResults(lang, search.trim())}
          </p>
        ) : (
          // No overflow-hidden here: it would clip the last rows' ⋯ menus.
          <ul className={`${panelClass} divide-y divide-icon-color/10`}>
            {visibleStudents.map((student) => (
              <StudentRosterRow
                key={student.id}
                student={student}
                onOpen={() => openStudent(student)}
                actions={rowActions(student)}
                busy={busyStudentId === student.id}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default StudentLists;
