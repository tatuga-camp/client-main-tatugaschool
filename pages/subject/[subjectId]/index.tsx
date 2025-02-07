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
import { MdFullscreen, MdFullscreenExit, MdMenu } from "react-icons/md";
import { SlPicture } from "react-icons/sl";
import Swal from "sweetalert2";
import DefaultLayout from "../../../components/layout/DefaultLayout";
import SubjectLayout from "../../../components/layout/SubjectLayout";
import ListMemberCircle from "../../../components/member/ListMemberCircle";
import Attendance from "../../../components/subject/Attendance";
import AttendanceChecker from "../../../components/subject/AttendanceChecker";
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
import PopupLayout from "../../../components/layout/PopupLayout";
type Props = {
  subjectId: string;
};

function Index({ subjectId }: Props) {
  const toast = React.useRef<Toast>(null);
  const queryClient = useQueryClient();
  const ding = useSound("/sounds/ding.mp3");
  const router = useRouter();
  const subject = useGetSubject({
    subjectId: subjectId,
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
      selectFooter === "Wheel Of Name" &&
      subject.data &&
      subject.data.wheelOfNamePath
    ) {
      window.open(
        `https://wheelofnames.com/${subject?.data.wheelOfNamePath}`,
        "_blank"
      );
      setSelectFooter("EMTY");
    } else if (
      selectFooter === "Wheel Of Name" &&
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
    } else if (selectFooter === "Stop Watch") {
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
        <div className="flex justify-center gap-3 flex-col items-center h-screen">
          <h1 className="text-4xl text-red-500">
            {subject.error?.message || "Something went wrong"}
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-primary-color w-40 text-white px-4 py-2 rounded-md"
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

        {selectFooter === "Slide Picker" && randomStudents && (
          <PopupLayout onClose={() => setSelectFooter("EMTY")}>
            <div className="bg-white w-full h-full md:w-max md:h-max  p-5 md:rounded-md md:border">
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
          <div
            className="w-screen z-50 h-screen flex items-center 
        justify-center fixed top-0 right-0 left-0 bottom-0 m-auto"
          >
            <div
              className={`${
                triggerFullScreen
                  ? "h-screen w-screen p-10"
                  : "h-screen w-screen p-10 md:w-9/12 md:h-5/6 md:p-5 "
              } flex flex-col gap-1 border bg-white 
             rounded-md overflow-hidden`}
            >
              <div className="w-full flex gap-2 justify-end">
                <button
                  onClick={() => setSelectFooter("EMTY")}
                  className="text-lg hover:bg-gray-300/50 w-6  h-6  rounded
         flex items-center justify-center font-semibold"
                >
                  <IoMdClose />
                </button>
                <button
                  onClick={() => setTriggerFullScreen((prev) => !prev)}
                  className="second-button text-lg flex items-center w-6  h-6  justify-center gap-1 "
                >
                  {triggerFullScreen ? (
                    <div className="flex items-center justify-center gap-1">
                      <MdFullscreenExit />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <MdFullscreen />
                    </div>
                  )}
                </button>
              </div>
              <AttendanceChecker
                toast={toast}
                subjectId={subjectId}
                onClose={() => setSelectFooter("EMTY")}
              />
            </div>
            <div
              onClick={() => setSelectFooter("EMTY")}
              className="w-screen -z-10 h-screen bg-black/50  fixed top-0 right-0 left-0 bottom-0 m-auto"
            ></div>
          </div>
        )}
        {subject.data && triggerQRCode && (
          <div
            className="w-screen z-40 h-screen flex items-center 
        justify-center fixed top-0 right-0 left-0 bottom-0 m-auto"
          >
            <div className="w-[30rem] bg-white drop-shadow-md p-5 h-[30rem] rounded-md overflow-hidden">
              <QRCode
                url={`${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/?subject_code=${subject.data?.code}`}
                code={subject.data?.code}
                setTriggerQRCode={setTriggerQRCode}
              />
            </div>
            <div
              onClick={() => setTriggerQRCode(false)}
              className="w-screen 
            -z-10 h-screen bg-white/50 backdrop-blur  fixed top-0 right-0 left-0 bottom-0 m-auto"
            ></div>
          </div>
        )}
        {triggerInviteTeacher && (
          <PopupLayout onClose={() => setTriggerInviteTeacher(false)}>
            <div className="  border rounded-md">
              <InviteTeacher
                setTrigger={setTriggerInviteTeacher}
                subjectId={subjectId}
              />
            </div>
          </PopupLayout>
        )}
        {selectStudent && (
          <PopupLayout onClose={() => setSelectStudent(null)}>
            <div className="max-h-[calc(100vh-12rem)] md:max-h-screen">
              <PopUpStudent
                student={selectStudent}
                setSelectStudent={setSelectStudent}
                toast={toast}
              />
            </div>
          </PopupLayout>
        )}
        <header className="md:max-w-screen-md xl:max-w-screen-lg mx-auto w-full p-5 lg:py-10 pb-10 flex items-center justify-center">
          <section
            className={`w-full z-30 overflow-hidden h-60 relative flex flex-col-reverse md:flex-row justify-between p-5 shadow-inner ${
              loading
                ? "animate-pulse bg-gray-500/50"
                : subject.data?.backgroundImage
                ? ""
                : "gradient-bg"
            } lg:rounded-md`}
          >
            {subject.data?.backgroundImage && (
              <div className="gradient-shadow -z-10 absolute w-full h-full top-0 bottom-0 right-0 left-0 m-auto"></div>
            )}
            {subject.data?.backgroundImage && (
              <Image
                src={subject.data?.backgroundImage}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  subject.data?.blurHash ?? defaultBlurHash
                )}
                alt="background"
                className="object-cover -z-20"
              />
            )}
            <div className="flex flex-col justify-end gap-1">
              <h1 className="text-lg font-semibold w-full lg:w-8/12 line-clamp-2 text-white">
                {subject.data ? subject.data?.title : "Loading..."}
              </h1>
              <p className="text-lg w-full lg:w-11/12 line-clamp-2 text-white">
                {subject.data ? subject.data?.description : "Loading..."}
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="bg-white w-max px-2 py-1 rounded-md">
                  <h2 className="text-xs text-primary-color">
                    Academic year:{" "}
                    {subject.data ? subject.data?.educationYear : "Loading..."}
                  </h2>
                </div>
                <div className="bg-white w-max px-2 py-1 rounded-md">
                  <h2 className="text-xs text-primary-color">
                    Subject Code:{" "}
                    {subject.data ? subject.data?.code : "Loading..."}
                  </h2>
                </div>
              </div>
            </div>
            <div
              className="flex flex-col items-end justify-between mt-4 lg:mt-0"
              onMouseOut={() => setIsMenuVisible(false)}
            >
              <button
                onClick={() => setIsMenuVisible((prev) => !prev)}
                className="flex items-center active:scale-110 justify-center gap-1 hover:bg-primary-color hover:text-white
                text-primary-color bg-white w-max px-2 py-1 rounded-md md:hidden"
              >
                <MdMenu />
              </button>
              <div
                className={`h-full flex-col items-end justify-between ${
                  isMenuVisible
                    ? "flex flex-col bg-white/50 rounded-md p-5 animate-in fade-in-0"
                    : "hidden"
                } md:flex`}
              >
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectMenu("Setting-Subject")}
                    className="flex items-center active:scale-110 justify-center gap-1 hover:bg-primary-color hover:text-white
                      text-primary-color bg-white w-max px-2 py-1 rounded-md"
                  >
                    <CiCircleInfo />
                    More Info & Edit
                  </button>
                  <label
                    title="Change Background Image"
                    className="flex items-center cursor-pointer active:scale-110 justify-center gap-1
                      hover:bg-primary-color hover:text-white
                      text-primary-color bg-white w-max px-2 py-1 rounded-md"
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
                <div className="flex gap-3 mt-2">
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
                    className="flex w-40 items-center text-xs active:scale-110 
                      justify-center gap-1 hover:bg-primary-color hover:text-white
                      text-primary-color bg-white px-2 py-1 rounded-md"
                  >
                    QR Code Subject
                    <IoQrCode />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </header>
        <main>
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
          {selectMenu === "Setting-Subject" && (
            <Setting
              subjectId={subjectId}
              setSelectMenu={(menu: string) =>
                setSelectMenu(menu as MenuSubject)
              }
            />
          )}
        </main>
        <footer
          className="h-96
        "
        ></footer>
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
