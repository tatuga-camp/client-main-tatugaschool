import React, { useCallback, useEffect, useState } from "react";
import Layout from "../../../components/layout/SubjectLayout";
import Head from "next/head";
import {
  useGetStudentOnSubject,
  useGetSubject,
  useGetTeacherOnSubject,
  useGetUser,
} from "../../../react-query";
import { GetServerSideProps } from "next";
import Grade from "../../../components/subject/Grade";
import Attendance from "../../../components/subject/Attendance";
import { Skeleton } from "primereact/skeleton";
import { CiCircleInfo } from "react-icons/ci";
import ListMemberCircle from "../../../components/member/ListMemberCircle";
import { ListMenuFooter } from "../../../components/subject/FooterSubject";
import Setting from "../../../components/subject/Setting";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { notFound } from "next/navigation";
import PopUpStudent from "../../../components/subject/PopUpStudent";
import {
  ErrorMessages,
  ScoreOnStudent,
  StudentOnSubject,
  Subject as SubjectType,
} from "../../../interfaces";
import useClickOutside from "../../../hook/useClickOutside";
import InviteTeacher from "../../../components/subject/InviteTeacher";
import { defaultBlurHash, MenuSubject } from "../../../data";
import { SlPicture } from "react-icons/sl";
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
  localStorageSetRemoveRandomStudents,
  setAccessToken,
} from "../../../utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Subject from "../../../components/subject/Subject";
import Image from "next/image";
import { IoQrCode } from "react-icons/io5";
import QRCode from "../../../components/subject/QRCode";
import StopWatch from "../../../components/subject/StopWatch";
import { useSound } from "../../../hook";
import SilderPicker from "../../../components/subject/SilderPicker";
import AttendanceChecker from "../../../components/subject/AttendanceChecker";
import { Toast } from "primereact/toast";
import { MdFullscreen, MdFullscreenExit, MdMenu } from "react-icons/md";
import Classwork from "../../../components/subject/Classwork";
import { IoMdClose } from "react-icons/io";
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
  const inviteTeacherRef = React.useRef<HTMLDivElement>(null);
  const teacherOnSubjects = useGetTeacherOnSubject({
    subjectId: subjectId,
  });
  const [randomStudents, setRandomStudents] = React.useState<
    StudentOnSubject[]
  >([]);
  const [selectMenu, setSelectMenu] = React.useState<MenuSubject>("Subject");
  const [selectFooter, setSelectFooter] =
    React.useState<ListMenuFooter>("EMTY");
  const [selectStudent, setSelectStudent] = React.useState<StudentOnSubject | null>(null);
  const [triggerInviteTeacher, setTriggerInviteTeacher] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const qrcodeRef = React.useRef<HTMLDivElement>(null);
  const [triggerQRCode, setTriggerQRCode] = React.useState(false);
  const [triggerStopWatch, setTriggerStopWatch] = React.useState(false);
  const [triggerFullScreen, setTriggerFullScreen] = React.useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  useClickOutside(divRef, () => {
    setSelectStudent(null);
  });
  useClickOutside(qrcodeRef, () => {
    setTriggerQRCode(() => false);
  });

  useClickOutside(inviteTeacherRef, () => {
    setTriggerInviteTeacher(() => false);
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

  if (subject.isError) {
    Swal.fire({
      title: "Error",
      text: "Subject not found",
      icon: "error",
    });
    router.push("/404");
  }

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
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Layout
        setSelectFooter={setSelectFooter}
        selectFooter={selectFooter}
        subject={subject}
        setSelectMenu={
          setSelectMenu as React.Dispatch<React.SetStateAction<string>>
        }
        selectMenu={selectMenu}
      >
        <Toast ref={toast} />
        {triggerStopWatch && <StopWatch onClose={handleCloseStopWatch} />}

        {selectFooter === "Slide Picker" && randomStudents && (
          <div
            className="w-screen z-50 h-screen flex items-center 
        justify-center fixed top-0 right-0 left-0 bottom-0 m-auto"
          >
            <div className="bg-white p-5 rounded-md border">
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
            <div
              onClick={() => setSelectFooter("EMTY")}
              className="w-screen -z-10 h-screen bg-black/50 backdrop-blur  fixed top-0 right-0 left-0 bottom-0 m-auto"
            ></div>
          </div>
        )}
        {selectFooter === "Attendance" && (
          <div
            className="w-screen z-50 h-screen flex items-center 
        justify-center fixed top-0 right-0 left-0 bottom-0 m-auto"
          >
            <div
              className={`${triggerFullScreen
                ? "h-screen w-screen p-10"
                : "w-9/12 h-5/6 p-5 "
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
            <div
              ref={qrcodeRef}
              className="w-[30rem] bg-white drop-shadow-md p-5 h-[30rem] rounded-md overflow-hidden"
            >
              <QRCode
                url={`${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/school/${subject.data?.schoolId}?subjectId=${subject.data?.id}`}
                code={subject.data?.code}
                setTriggerQRCode={setTriggerQRCode}
              />
            </div>
            <div className="w-screen -z-10 h-screen bg-white/50 backdrop-blur  fixed top-0 right-0 left-0 bottom-0 m-auto"></div>
          </div>
        )}
        {triggerInviteTeacher && (
          <div
            className="w-screen z-40 h-screen flex items-center 
        justify-center fixed top-0 right-0 left-0 bottom-0 m-auto"
          >
            <div className="  border rounded-md" ref={inviteTeacherRef}>
              <InviteTeacher
                setTrigger={setTriggerInviteTeacher}
                subjectId={subjectId}
              />
            </div>
            <div className="w-screen -z-10 h-screen bg-black/50 backdrop-blur  fixed top-0 right-0 left-0 bottom-0 m-auto"></div>
          </div>
        )}
        {selectStudent && (
          <div
            className="fixed top-28 md:top-20 z-40 right-0 left-0 md:bottom-0 m-auto
         w-screen overflow-scroll md:h-screen flex items-center justify-center"
          >
            <div className="max-h-[calc(100vh-12rem)] md:max-h-screen" ref={divRef}>
              <PopUpStudent
                student={selectStudent}
                setSelectStudent={setSelectStudent}
                toast={toast}
              />
            </div>
            <div
              className="w-screen h-screen fixed top-0 bg-black/20 backdrop-blur
           -z-10 right-0 left-0 bottom-0 m-auto "
            ></div>
          </div>
        )}
        <header className="w-full p-5 lg:p-10 pb-10 flex items-center justify-center">
          <section
            className={`w-full lg:w-10/12 z-30 overflow-hidden h-60 relative flex flex-col-reverse md:flex-row justify-between p-5 shadow-inner ${loading
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
            <div className="flex flex-col items-end justify-between mt-4 lg:mt-0" onMouseOut={() => setIsMenuVisible(false)}>
              <button
                onClick={() => setIsMenuVisible((prev) => !prev)}
                className="flex items-center active:scale-110 justify-center gap-1 hover:bg-primary-color hover:text-white
                text-primary-color bg-white w-max px-2 py-1 rounded-md md:hidden"
              >
                <MdMenu />
              </button>
              <div className={`h-full flex-col items-end justify-between ${isMenuVisible ? "flex flex-col bg-white/50 rounded-md p-5 animate-in fade-in-0" : "hidden"} md:flex`}>
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
        <main className="">
          {selectMenu === "Subject" && (
            <Subject
              toast={toast}
              setSelectStudent={setSelectStudent}
              subjectId={subjectId}
            />
          )}{" "}
          {selectMenu === "Classwork" && (
            <Classwork subjectId={subjectId} toast={toast} />
          )}
          {selectMenu === "Grade" && <Grade />}
          {selectMenu === "Attendance" && (
            <Attendance toast={toast} subjectId={subjectId} />
          )}
          {selectMenu === "Setting-Subject" && (
            <Setting subjectId={subjectId} setSelectMenu={(menu: string) => setSelectMenu(menu as MenuSubject)}/>
          )}
        </main>
        <footer
          className="h-96
        "
        ></footer>
      </Layout>
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
    setAccessToken({ access_token: accessToken.accessToken });

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
