import Image from "next/image";
import { Toast } from "primereact/toast";
import React, { memo, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MdImage } from "react-icons/md";
import Swal from "sweetalert2";
import {
  ErrorMessages,
  ScoreOnSubject,
  StudentOnSubject,
} from "../../interfaces";
import { useCreateScoreOnStudent } from "../../react-query";
import AvatarSetting from "./AvatarSetting";
import ScorePanel from "./ScorePanel";

type Props = {
  onClose: () => void;
  student: StudentOnSubject;
  toast: React.RefObject<Toast>;
};
function PopUpStudent({ student, onClose, toast }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(true);
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
      // Play a detached, fire-and-forget sound. The modal unmounts immediately
      // via handleCloseModal(), and useSound()'s cleanup pauses its pooled audio
      // element on unmount — which would cut the sound off. A one-shot Audio that
      // isn't tied to this component's lifecycle survives the unmount and plays
      // to completion. (Safe here: this is a discrete click, not a hot render path.)
      const oneShotSound = new Audio(
        data.score >= 0 ? "/sounds/ding.mp3" : "/sounds/fail.mp3",
      );
      oneShotSound.play().catch(() => {});
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
    onClose();
    document.body.style.overflow = "auto";
  };

  if (!isModalOpen) return null;

  return (
    <section className="relative flex w-full flex-col items-center gap-5 rounded-2xl border-2 border-black bg-white p-5 pb-0 md:w-10/12 md:flex-row xl:w-7/12">
      <button
        onClick={handleCloseModal}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
      >
        <IoMdClose />
      </button>
      <div className="flex h-max w-full flex-col items-center justify-center gap-1 rounded-2xl border bg-white pb-1 md:w-40">
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
