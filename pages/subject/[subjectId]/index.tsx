import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Toast } from "primereact/toast";
import React, { useCallback, useEffect, useState } from "react";
import { CiCircleInfo } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { IoQrCode } from "react-icons/io5";
import { MdFullscreen, MdFullscreenExit, MdLock, MdMenu } from "react-icons/md";
import { SlPicture } from "react-icons/sl";
import Swal from "sweetalert2";
import DefaultLayout from "../../../components/layout/DefaultLayout";
import PopupLayout from "../../../components/layout/PopupLayout";
import SubjectLayout from "../../../components/layout/SubjectLayout";
import ListMemberCircle from "../../../components/member/ListMemberCircle";
import Attendance from "../../../components/subject/Attendance";
import AttendanceChecker from "../../../components/subject/AttendanceChecker";
import AttendanceQRcode from "../../../components/subject/AttendanceQRcode";
import Classwork from "../../../components/subject/Classwork";
import { ListMenuFooter } from "../../../components/subject/FooterSubject";
import Grade from "../../../components/subject/Grade";
import InviteTeacher from "../../../components/subject/InviteTeacher";
import PopUpStudent from "../../../components/subject/PopUpStudent";
import QRCode from "../../../components/subject/QRCode";
import Setting from "../../../components/subject/Setting";
import SilderPicker from "../../../components/subject/SilderPicker";
import StopWatch from "../../../components/subject/StopWatch";
import Subject from "../../../components/subject/Subject";
import { defaultBlurHash, MenuSubject } from "../../../data";
import { useSound } from "../../../hook";
import useClickOutside from "../../../hook/useClickOutside";
import { ErrorMessages, StudentOnSubject } from "../../../interfaces";
import {
  useGetLanguage,
  useGetSchool,
  useGetStudentOnSubject,
  useGetSubject,
  useGetTeacherOnSubject,
} from "../../../react-query";
import {
  getSignedURLTeacherService,
  RefreshTokenService,
  RequestUpdateSubjectService,
  UpdateSubjectService,
  UploadSignURLService,
} from "../../../services";
import {
  decodeBlurhashToCanvas,
  generateBlurHash,
  getRefetchtoken,
  localStorageGetRemoveRandomStudents,
} from "../../../utils";
import { subjectDataLanguage } from "../../../data/languages";
type Props = {
  subjectId: string;
};

function Index({ subjectId }: Props) {
  const toast = React.useRef<Toast>(null);
  const queryClient = useQueryClient();
  const ding = useSound("/sounds/ding.mp3");
  const language = useGetLanguage();
  const router = useRouter();
  const subject = useGetSubject({
    subjectId: subjectId,
  });
  const school = useGetSchool({
    schoolId: subject.data?.schoolId ?? "",
  });
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId: subjectId,
  });
  const divRef = React.useRef<HTMLDivElement>(null);
  const teacherOnSubjects = useGetTeacherOnSubject({
    subjectId: subjectId,
  });
  const [randomStudents, setRandomStudents] = React.useState<
    StudentOnSubject[]
  >([]);

  const [selectMenu, setSelectMenu] = React.useState<MenuSubject>("Subject");
  const [selectFooter, setSelectFooter] =
    React.useState<ListMenuFooter>("EMTY");
  const [selectStudent, setSelectStudent] =
    React.useState<StudentOnSubject | null>(null);
  const [triggerInviteTeacher, setTriggerInviteTeacher] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [triggerQRCode, setTriggerQRCode] = React.useState(false);
  const [triggerStopWatch, setTriggerStopWatch] = React.useState(false);
  const [triggerFullScreen, setTriggerFullScreen] = React.useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  useClickOutside(divRef, () => {
    setSelectStudent(null);
  });

  useEffect(() => {
    if (
      selectFooter === "WheelOfName" &&
      subject.data &&
      subject.data.wheelOfNamePath
    ) {
      window.open(
        `https://wheelofnames.com/${subject?.data.wheelOfNamePath}`,
        "_blank",
      );
      setSelectFooter("EMTY");
    } else if (
      selectFooter === "WheelOfName" &&
      subject.data &&
      !subject.data.wheelOfNamePath
    ) {
      Swal.fire({
        title: "Not Ready",
        text: "Wheel of name not ready yet, please try again later in a few minutes",
        footer: "We will notify you when it's ready on your email",
        icon: "info",
      });
      setSelectFooter("EMTY");
    } else if (selectFooter === "StopWatch") {
      setTriggerStopWatch(true);
    } else {
      setTriggerStopWatch(false);
    }
  }, [selectFooter]);

  const updateSubject = useMutation({
    mutationKey: ["update-subject"],
    mutationFn: (input: RequestUpdateSubjectService) =>
      UpdateSubjectService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(["subject", { id: subjectId }], () => {
        return data;
      });
    },
  });

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {
        throw new Error("File not found");
      }
      setLoading(true);
      const signURL = await getSignedURLTeacherService({
        fileName: file?.name,
        fileType: file?.type,
        schoolId: subject.data?.schoolId,
        fileSize: file.size,
      });

      const blurHash = await generateBlurHash(file);
      console.log(blurHash);
      await UploadSignURLService({
        file: file,
        signURL: signURL.signURL,
        contentType: file.type,
      });
      await updateSubject.mutateAsync({
        query: { subjectId: subjectId },
        body: {
          backgroundImage: signURL.originalURL,
          blurHash: blurHash,
        },
      });

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

  const title = `Subject ${subject.data?.title ?? "Loading..."}`;

  const handleCloseStopWatch = useCallback(() => {
    setTriggerStopWatch(false);
  }, []);

  useEffect(() => {
    if (studentOnSubjects.data) {
      const localStorageStudents = localStorageGetRemoveRandomStudents({
        subjectId: subjectId,
      });

      if (localStorageStudents?.length === 0 || !localStorageStudents) {
        const ids = studentOnSubjects.data.map((student) => {
          return { id: student.id };
        });

        setRandomStudents(studentOnSubjects.data);
      } else {
        const randomStudents = studentOnSubjects.data.filter((student) => {
          return !localStorageStudents.some((localStudent) => {
            return localStudent.id === student.id;
          });
        });
        setRandomStudents(randomStudents);
      }
    }
  }, [studentOnSubjects.data, selectFooter]);

  useEffect(() => {
    if (router.isReady) {
      const menu = router.query.menu as MenuSubject;
      if (menu) {
        setSelectMenu(menu);
      }
    }
  }, [router.isReady]);

  if (subject.error) {
    return (
      <DefaultLayout>
        <div className="flex h-screen flex-col items-center justify-center gap-3">
          <h1 className="text-4xl text-red-500">
            {subject.error?.message || "Something went wrong"}
          </h1>
          <button
            onClick={() => router.back()}
            className="w-40 rounded-md bg-primary-color px-4 py-2 text-white"
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
      <SubjectLayout
        setSelectFooter={setSelectFooter}
        selectFooter={selectFooter}
        subjectId={subjectId}
        setSelectMenu={
          setSelectMenu as React.Dispatch<React.SetStateAction<string>>
        }
        selectMenu={selectMenu}
      >
        <Toast ref={toast} />
        {triggerStopWatch && <StopWatch onClose={handleCloseStopWatch} />}

        {selectFooter === "AttendanceQRCode" && (
          <PopupLayout onClose={() => setSelectFooter("EMTY")}>
            <AttendanceQRcode
              toast={toast}
              onClose={() => setSelectFooter("EMTY")}
              subjectId={subjectId}
            />
          </PopupLayout>
        )}

        {selectFooter === "SlidePicker" && randomStudents && (
          <PopupLayout onClose={() => setSelectFooter("EMTY")}>
            <div className="h-full w-full bg-white p-5 md:h-max md:w-max md:rounded-md md:border">
              <SilderPicker<StudentOnSubject>
                images={randomStudents
                  .filter((s) => s.isActive)
                  .map((student, index) => {
                    return {
                      ...student,
                    };
                  })}
                subjectId={subjectId}
                setSelectFooter={setSelectFooter}
              />
            </div>
          </PopupLayout>
        )}
        {selectFooter === "Attendance" && (
          <PopupLayout onClose={() => setSelectFooter("EMTY")}>
            <AttendanceChecker
              toast={toast}
              subjectId={subjectId}
              onClose={() => {
                document.body.style.overflow = "auto";
                setSelectFooter("EMTY");
              }}
            />
          </PopupLayout>
        )}
        {subject.data && triggerQRCode && (
          <PopupLayout onClose={() => setTriggerQRCode(false)}>
            <QRCode
              url={`${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/?subject_code=${subject.data?.code}`}
              code={subject.data?.code}
              setTriggerQRCode={setTriggerQRCode}
            />
          </PopupLayout>
        )}
        {triggerInviteTeacher && (
          <PopupLayout onClose={() => setTriggerInviteTeacher(false)}>
            <div className="rounded-md border">
              <InviteTeacher
                setTrigger={setTriggerInviteTeacher}
                subjectId={subjectId}
              />
            </div>
          </PopupLayout>
        )}
        {selectStudent && (
          <PopupLayout onClose={() => setSelectStudent(null)}>
            <PopUpStudent
              student={selectStudent}
              setSelectStudent={setSelectStudent}
              toast={toast}
            />
          </PopupLayout>
        )}
        <header className="mx-auto flex w-full items-center justify-center p-5 pb-10 md:max-w-screen-md lg:py-10 xl:max-w-screen-lg">
          <section
            className={`relative z-30 flex h-60 w-full flex-col-reverse justify-between overflow-hidden p-5 shadow-inner md:flex-row ${
              loading
                ? "animate-pulse bg-gray-500/50"
                : subject.data?.backgroundImage
                  ? ""
                  : subject.data?.isLocked === true
                    ? "bg-gray-400/90"
                    : "gradient-bg"
            } lg:rounded-md`}
          >
            {subject.data?.backgroundImage && (
              <div
                className={`${subject.data.isLocked === true ? "bg-gray-400/90" : "gradient-shadow"} absolute bottom-0 left-0 right-0 top-0 -z-10 m-auto h-full w-full`}
              ></div>
            )}
            {subject.data?.backgroundImage && (
              <Image
                src={subject.data?.backgroundImage}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  subject.data?.blurHash ?? defaultBlurHash,
                )}
                alt="background"
                className="-z-20 object-cover"
              />
            )}
            <div className="flex flex-col justify-end gap-1">
              <h1 className="line-clamp-2 w-full text-lg font-semibold text-white lg:w-8/12">
                {subject.data ? subject.data?.title : "Loading..."}
              </h1>
              <p className="line-clamp-2 w-full text-lg text-white lg:w-11/12">
                {subject.data ? subject.data?.description : "Loading..."}
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="w-max rounded-md bg-white px-2 py-1">
                  <h2 className="text-xs text-primary-color">
                    {subjectDataLanguage.educationYear(language.data ?? "en")}:{" "}
                    {subject.data ? subject.data?.educationYear : "Loading..."}
                  </h2>
                </div>
                <div className="w-max rounded-md bg-white px-2 py-1">
                  <h2 className="text-xs text-primary-color">
                    {subjectDataLanguage.code(language.data ?? "en")}:{" "}
                    {subject.data ? subject.data?.code : "Loading..."}
                  </h2>
                </div>
              </div>
            </div>
            <div
              className="mt-4 flex flex-col items-end justify-between lg:mt-0"
              onMouseOut={() => setIsMenuVisible(false)}
            >
              <button
                onClick={() => setIsMenuVisible((prev) => !prev)}
                className="flex w-max items-center justify-center gap-1 rounded-md bg-white px-2 py-1 text-primary-color hover:bg-primary-color hover:text-white active:scale-110 md:hidden"
              >
                <MdMenu />
              </button>
              <div
                className={`h-full flex-col items-end justify-between ${
                  isMenuVisible
                    ? "animate-in fade-in-0 flex flex-col rounded-md bg-white/50 p-5"
                    : "hidden"
                } md:flex`}
              >
                <div className="flex gap-2">
                  {subject.data?.isLocked === true && (
                    <div
                      title="This Subject is being locked"
                      className="flex w-max items-center justify-center rounded-md px-2 py-1 text-white hover:bg-gray-300/50"
                    >
                      <span className="text-sm">Subject is locked</span>{" "}
                      <MdLock />
                    </div>
                  )}
                  <button
                    onClick={() => setSelectMenu("SettingSubject")}
                    className="flex w-max items-center justify-center gap-1 rounded-md bg-white px-2 py-1 text-primary-color hover:bg-primary-color hover:text-white active:scale-110"
                  >
                    <CiCircleInfo />
                    {subjectDataLanguage.moreInfo(language.data ?? "en")}
                  </button>
                  <label
                    title="Change Background Image"
                    className="flex w-max cursor-pointer items-center justify-center gap-1 rounded-md bg-white px-2 py-1 text-primary-color hover:bg-primary-color hover:text-white active:scale-110"
                  >
                    <SlPicture />
                    <input
                      disabled={loading}
                      accept="image/*"
                      id="dropzone-file"
                      onChange={handleUploadImage}
                      type="file"
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="mt-2 flex gap-3">
                  {teacherOnSubjects.data ? (
                    <ListMemberCircle
                      setTrigger={setTriggerInviteTeacher}
                      members={teacherOnSubjects.data}
                    />
                  ) : (
                    "Loading..."
                  )}
                  <button
                    onClick={() => setTriggerQRCode((prev) => !prev)}
                    aria-label="QR Code Subject"
                    className="flex w-40 items-center justify-center gap-1 rounded-md bg-white px-2 py-1 text-xs text-primary-color hover:bg-primary-color hover:text-white active:scale-110"
                  >
                    {subjectDataLanguage.qrCode(language.data ?? "en")}
                    <IoQrCode />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </header>
        <main className="flex w-full flex-col items-center">
          {selectMenu === "Subject" && (
            <Subject
              toast={toast}
              setSelectStudent={setSelectStudent}
              subjectId={subjectId}
            />
          )}{" "}
          {selectMenu === "Classwork" && subject.data && (
            <Classwork
              schoolId={subject.data?.schoolId}
              subjectId={subjectId}
              toast={toast}
            />
          )}
          {selectMenu === "Grade" && (
            <Grade toast={toast} subjectId={subjectId} />
          )}
          {selectMenu === "Attendance" && (
            <Attendance toast={toast} subjectId={subjectId} />
          )}
          {selectMenu === "SettingSubject" && school.data && (
            <Setting
              subjectId={subjectId}
              schoolId={school.data.id}
              setSelectMenu={(menu: string) =>
                setSelectMenu(menu as MenuSubject)
              }
            />
          )}
        </main>
        <footer className="h-96"></footer>
      </SubjectLayout>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const params = ctx.params;

    if (!params?.subjectId) {
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
