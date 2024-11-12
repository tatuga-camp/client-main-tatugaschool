import React, { useCallback, useEffect } from "react";
import Layout from "../../../components/layout/SubjectLayout";
import Head from "next/head";
import {
  useGetSubject,
  useGetTeacherOnSubject,
  useGetUser,
} from "../../../react-query";
import { GetServerSideProps } from "next";
import Assignment from "../../../components/subject/Assignment";
import Grade from "../../../components/subject/Grade";
import Attendance from "../../../components/subject/Attendance";
import { Skeleton } from "primereact/skeleton";
import { CiCircleInfo } from "react-icons/ci";
import ListMemberCircle from "../../../components/member/ListMemberCircle";
import { ListMenuFooter } from "../../../components/subject/FooterSubject";
import Setting from "../../../components/subject/Setting";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
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
  RequestUpdateSubjectService,
  UpdateSubjectService,
  UploadSignURLService,
} from "../../../services";
import { decodeBlurhashToCanvas, generateBlurHash } from "../../../utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Subject from "../../../components/subject/Subject";
import Image from "next/image";
import { IoQrCode } from "react-icons/io5";
import QRCode from "../../../components/subject/QRCode";
import StopWatch from "../../../components/subject/StopWatch";
import AttendanceChecker from "../../../components/subject/AttendanceChecker";
import { Toast } from "primereact/toast";

type Props = {
  subjectId: string;
};

function Index({ subjectId }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const subject = useGetSubject({
    subjectId: subjectId,
  });
  const toast = React.useRef<Toast>(null);
  const divRef = React.useRef<HTMLDivElement>(null);
  const inviteTeacherRef = React.useRef<HTMLDivElement>(null);
  const teacherOnSubjects = useGetTeacherOnSubject({
    subjectId: subjectId,
  });
  const [selectMenu, setSelectMenu] = React.useState<MenuSubject>("Subject");
  const [selectFooter, setSelectFooter] =
    React.useState<ListMenuFooter>("EMTY");
  const [selectStudent, setSelectStudent] = React.useState<StudentOnSubject>();
  const [triggerInviteTeacher, setTriggerInviteTeacher] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const qrcodeRef = React.useRef<HTMLDivElement>(null);
  const [triggerQRCode, setTriggerQRCode] = React.useState(false);

  useClickOutside(divRef, () => {
    setSelectStudent(() => undefined);
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
    setSelectFooter("EMTY");
  }, []);
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
        {selectFooter === "Stop Watch" && (
          <StopWatch onClose={handleCloseStopWatch} />
        )}
        <Toast ref={toast} />

        {selectFooter === "Attendance" && (
          <div
            className="w-screen z-50 h-screen flex items-center 
        justify-center fixed top-0 right-0 left-0 bottom-0 m-auto"
          >
            <div className="w-9/12 border bg-white p-5 h-max rounded-md overflow-hidden">
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
            className="w-screen z-50 h-screen flex items-center 
        justify-center fixed top-0 right-0 left-0 bottom-0 m-auto"
          >
            <div
              ref={qrcodeRef}
              className="w-[30rem] bg-white drop-shadow-md p-5 h-[30rem] rounded-md overflow-hidden"
            >
              <QRCode
                url={`${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/school/${subject.data?.schoolId}?subjectId=${subject.data?.id}`}
                code={subject.data?.code}
              />
            </div>
            <div className="w-screen -z-10 h-screen bg-white/50 backdrop-blur  fixed top-0 right-0 left-0 bottom-0 m-auto"></div>
          </div>
        )}
        {triggerInviteTeacher && (
          <div
            className="w-screen z-50 h-screen flex items-center 
        justify-center fixed top-0 right-0 left-0 bottom-0 m-auto"
          >
            <div className="  border rounded-md" ref={inviteTeacherRef}>
              <InviteTeacher
                setTrigger={setTriggerInviteTeacher}
                subjectId={subjectId}
              />
            </div>
            <div className="w-screen -z-10 h-screen bg-white/50 backdrop-blur  fixed top-0 right-0 left-0 bottom-0 m-auto"></div>
          </div>
        )}
        {selectStudent && (
          <div
            className="fixed top-0 z-40 right-0 left-0 bottom-0 m-auto
         w-screen h-screen flex items-center justify-center"
          >
            <div className="" ref={divRef}>
              <PopUpStudent student={selectStudent} />
            </div>
            <div
              className="w-screen h-screen fixed top-0 bg-white/20 backdrop-blur
           -z-10 right-0 left-0 bottom-0 m-auto "
            ></div>
          </div>
        )}
        <header className="w-full p-10 flex items-center justify-center">
          <section
            className={`w-8/12 z-30 overflow-hidden h-60 relative flex justify-between  p-5 shadow-inner ${
              loading
                ? "animate-pulse bg-gray-500/50"
                : subject.data?.backgroundImage
                ? ""
                : "gradient-bg"
            }  rounded-md`}
          >
            {subject.data?.backgroundImage && (
              <div className="gradient-shadow  -z-10  absolute w-full h-full top-0 bottom-0 right-0 left-0 m-auto"></div>
            )}{" "}
            {subject.data?.backgroundImage && (
              <Image
                src={subject.data?.backgroundImage}
                fill
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  subject.data?.blurHash ?? defaultBlurHash
                )}
                alt="backgroud"
                className="object-cover -z-20 "
              />
            )}
            <div className="flex h-full justify-end flex-col gap-1">
              <h1 className="text-lg font-semibold w-8/12 min-w-96 line-clamp-2 text-white">
                {subject.data ? subject.data?.title : "Loading..."}
              </h1>
              <p className="text-lg w-11/12 min-w-96 line-clamp-2 text-white">
                {subject.data ? subject.data?.description : "Loading..."}
              </p>
              <div className="flex gap-2">
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
            <div className="h-full flex flex-col items-end justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectMenu("Setting Subject")}
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
              <div className="flex gap-3">
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
               text-primary-color bg-white  px-2 py-1 rounded-md"
                >
                  QR Code Subject
                  <IoQrCode />
                </button>
              </div>
            </div>
          </section>
        </header>
        <main className="">
          {selectMenu === "Subject" && (
            <Subject
              setSelectStudent={setSelectStudent}
              subjectId={subjectId}
            />
          )}{" "}
          {selectMenu === "Assignment" && <Assignment />}
          {selectMenu === "Grade" && <Grade />}
          {selectMenu === "Attendance" && (
            <Attendance toast={toast} subjectId={subjectId} />
          )}
          {selectMenu === "Setting Subject" && (
            <Setting subjectId={subjectId} />
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
  const params = ctx.params;

  if (!params?.subjectId) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      subjectId: params.subjectId,
    },
  };
};
