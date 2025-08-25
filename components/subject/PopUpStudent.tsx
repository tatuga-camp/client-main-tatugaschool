import Image from "next/image";
import { Toast } from "primereact/toast";
import React, { memo, RefObject, useEffect, useRef, useState } from "react";
import { CgSelect } from "react-icons/cg";
import { IoMdClose } from "react-icons/io";
import { MdImage, MdPhoto, MdUpload } from "react-icons/md";
import { RxAvatar } from "react-icons/rx";
import Swal from "sweetalert2";
import { defaultBlurHash, studentAvatars } from "../../data";
import { useSound } from "../../hook";
import {
  ErrorMessages,
  ScoreOnSubject,
  StudentOnSubject,
} from "../../interfaces";
import {
  useCreateScoreOnStudent,
  useUpdateStudentOnSubject,
} from "../../react-query";
import { generateBlurHash, urlToFile } from "../../utils";
import LoadingSpinner from "../common/LoadingSpinner";
import ScorePanel from "./ScorePanel";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../services";

type Props = {
  setSelectStudent: React.Dispatch<
    React.SetStateAction<StudentOnSubject | null>
  >;
  student: StudentOnSubject;
  toast: React.RefObject<Toast>;
};
function PopUpStudent({ student, setSelectStudent, toast }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const successSound = useSound("/sounds/ding.mp3");
  const failSound = useSound("/sounds/fail.mp3");
  const [triggerAvartar, setSetTriggerAvatar] = useState<boolean>(false);
  const createScoreOnStudent = useCreateScoreOnStudent();
  const [image, setImage] = useState<string>(student.photo);

  const [totalScore, setTotalScore] = React.useState<number>(
    student.totalSpeicalScore,
  );

  const [selectScore, setSelectScore] = React.useState<
    { score?: ScoreOnSubject } & { inputScore: number }
  >({
    inputScore: 0,
  });

  const handleCreateScore = async () => {
    try {
      if (!selectScore?.score) {
        Swal.fire({
          title: "Score Not Found",
          text: "Please select score first",
          icon: "error",
        });
        return;
      }

      const data = await createScoreOnStudent.mutateAsync({
        studentOnSubjectId: student.id,
        scoreOnSubjectId: selectScore?.score.id,
        score: selectScore?.inputScore,
      });

      setTotalScore((prev) => prev + data.score);
      if (data.score >= 0) {
        successSound?.play();
      } else {
        failSound?.play();
      }
      showSuccess();
      handleCloseModal();
    } catch (error) {
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

  const showSuccess = () => {
    toast.current?.show({
      severity: selectScore?.inputScore > 0 ? "success" : "error",
      summary: `${selectScore?.score?.title}`,
      detail: `${student.firstName} ${
        student.lastName
      } has been given a score ${(selectScore?.inputScore ?? 0) > 0 && "+"} ${
        selectScore?.inputScore
      }`,
      life: 3000,
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectStudent(null);
    document.body.style.overflow = "auto";
  };

  if (!isModalOpen) return null;

  return (
    <section className="relative flex w-full flex-col items-center gap-5 rounded-md border bg-white p-5 pb-0 md:w-10/12 md:flex-row xl:w-7/12">
      <button
        onClick={handleCloseModal}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
      >
        <IoMdClose />
      </button>
      <div className="flex h-max w-full flex-col items-center justify-center gap-1 rounded-md border bg-white pb-1 md:w-40">
        <div className="gradient-bg flex h-10 w-full items-center justify-center rounded-t-md md:w-40">
          <span className="text-lg font-semibold text-white">{totalScore}</span>
        </div>
        <div className="relative h-20 w-20">
          <Image
            src={image}
            alt="Student"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex h-16 w-full flex-col items-center justify-center md:w-40">
          <span className="text-sm font-semibold text-gray-800">
            {student.firstName} {student.lastName}
          </span>
          <span className="text-xs text-gray-500">Number {student.number}</span>
        </div>
        <button
          onClick={() => setSetTriggerAvatar((prev) => !prev)}
          className="second-button ga-2 flex items-center justify-center border text-sm"
        >
          <MdImage /> Change Avatar
        </button>
      </div>
      {triggerAvartar === false && (
        <ScorePanel
          subjectId={student.subjectId}
          onSelectScore={({ inputScore, score }) => {
            setSelectScore({ inputScore, score });
          }}
          selectScore={{
            score: selectScore?.score,
            inputScore: selectScore?.inputScore,
          }}
          isLoading={createScoreOnStudent.isPending}
          onCreateScore={handleCreateScore}
        />
      )}
      {triggerAvartar === true && (
        <AvatarSetting
          onUpdatePhoto={(url) => setImage(url)}
          toast={toast}
          studentOnSubject={student}
          onClose={() => setSetTriggerAvatar(false)}
        />
      )}
    </section>
  );
}

export default memo(PopUpStudent);

type AvatarSettingProps = {
  studentOnSubject: StudentOnSubject;
  toast: RefObject<Toast>;
  onUpdatePhoto: (url: string) => void;
  onClose: () => void;
};
function AvatarSetting({
  studentOnSubject,
  toast,
  onUpdatePhoto,
  onClose,
}: AvatarSettingProps) {
  const [selectAvatar, setSelectAvatar] = useState<string>(
    studentOnSubject.photo,
  );
  const updateStudentOnSubject = useUpdateStudentOnSubject();
  const selectedAvatarRef = useRef<HTMLLIElement>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (selectedAvatarRef.current) {
      selectedAvatarRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectAvatar]);

  const handleUpdateAvatar = async () => {
    try {
      setLoading(true);
      const file = await urlToFile(selectAvatar);
      if (!file) {
        const update = await updateStudentOnSubject.mutateAsync({
          query: {
            id: studentOnSubject.id,
          },
          data: {
            photo: selectAvatar,
            blurHash: defaultBlurHash,
          },
        });
        onUpdatePhoto(update.photo);
      } else {
        const blurHash = await generateBlurHash(file);
        const update = await updateStudentOnSubject.mutateAsync({
          query: {
            id: studentOnSubject.id,
          },
          data: {
            photo: selectAvatar,
            blurHash: blurHash,
          },
        });
        onUpdatePhoto(update.photo);
      }

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Update Success",
        life: 3000,
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

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];

      if (!file) throw new Error("No File Detect");
      setLoading(true);

      const signURL = await getSignedURLTeacherService({
        schoolId: studentOnSubject.schoolId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      await UploadSignURLService({
        signURL: signURL.signURL,
        file,
        contentType: file.type,
      });

      const blurHash = await generateBlurHash(file);

      const update = await updateStudentOnSubject.mutateAsync({
        query: {
          id: studentOnSubject.id,
        },
        data: {
          photo: signURL.originalURL,
          blurHash: blurHash,
        },
      });
      onUpdatePhoto(signURL.originalURL);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Update Success",
        life: 3000,
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

  return (
    <section className="flex h-96 w-full flex-col font-Anuphan">
      <header className="flex w-full flex-col gap-1 border-b pb-1">
        <div className="flex items-center justify-start gap-2 text-xl font-semibold">
          <RxAvatar /> Avatar Setting
        </div>
        <span className="text-sm font-normal text-gray-500">
          You can change avatar or upload avatar here
        </span>
      </header>

      <ul className="grid h-full w-full grid-cols-5 place-items-center gap-2 overflow-auto bg-gray-100 p-3">
        <label
          htmlFor="imageUpload"
          className={`relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-md bg-white hover:scale-105`}
        >
          <MdPhoto className="text-5xl" />
          <span className="text-xs">Upload Photo</span>
        </label>
        <input
          onChange={handleUploadImage}
          type="file"
          className="hidden"
          id="imageUpload"
          name="image"
          accept="image/*"
        />

        {studentAvatars.map((url, index) => {
          const isSelected = selectAvatar === url;

          return (
            <li
              key={index}
              ref={isSelected ? selectedAvatarRef : null}
              className={`relative ${
                isSelected && "ring-2"
              } h-24 w-24 cursor-pointer overflow-hidden rounded-md bg-white hover:scale-105`}
              onClick={() => setSelectAvatar(url)}
            >
              <Image
                src={url}
                fill
                alt="student avatar"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </li>
          );
        })}
      </ul>

      <footer className="flex h-20 w-full items-center justify-end gap-2 border-t">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              onClose();
            }}
            type="button"
            className="second-button flex w-40 items-center justify-center gap-1 border"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleUpdateAvatar}
            className="main-button flex w-40 items-center justify-center gap-1"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <CgSelect /> Select
              </>
            )}
          </button>
        </div>
      </footer>
    </section>
  );
}
