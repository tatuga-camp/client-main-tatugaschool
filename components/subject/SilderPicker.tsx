/* eslint-disable react-hooks/exhaustive-deps */
import { memo, RefObject, useEffect, useState } from "react";
import { AnimationImageItemProps } from "../animation/types/AnimationImageItemProps";
import AnimationCard from "../animation/AnimationCard";
import { ProgressSpinner } from "primereact/progressspinner";
import AnimationFireworkEffect from "../animation/AnimationFireworkEffect";
import { useSound } from "../../hook";
import Image from "next/image";
import {
  decodeBlurhashToCanvas,
  localStorageGetRemoveRandomStudents,
  localStorageSetRemoveRandomStudents,
} from "../../utils";
import { useGetStudentOnSubject } from "../../react-query";
import { defaultBlurHash } from "../../data";
import { ListMenuFooter } from "./FooterSubject";
import { IoCloseOutline, IoPersonAdd, IoPersonRemove } from "react-icons/io5";
import { UseQueryResult } from "@tanstack/react-query";
import { StudentOnSubject } from "../../interfaces";
import PopupLayout from "../layout/PopupLayout";
import PopUpStudent from "./PopUpStudent";
import { Toast } from "primereact/toast";
interface SilderPickerProps {
  students: StudentOnSubject[];
  subjectId: string;
  setSelectFooter: React.Dispatch<React.SetStateAction<ListMenuFooter>>;
  toast: RefObject<Toast>;
}

const SilderPicker = ({
  students,
  subjectId,
  setSelectFooter,
  toast,
}: SilderPickerProps) => {
  const [selectItem, setSelectItem] = useState<StudentOnSubject | null>(null);
  const [speedUp, SetSpeedUp] = useState(1);
  const cheering = useSound("/sounds/cheering.mp3");
  const ding = useSound("/sounds/ding.mp3");
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId: subjectId,
  });
  const [triggerScore, setTriggerScore] = useState(false);
  const [studentRemoveList, setStudentRemoveList] = useState<{ id: string }[]>(
    localStorageGetRemoveRandomStudents({ subjectId: subjectId }) ?? [],
  );
  const shuffleWithNoAdjacentDuplicates = (arr: any[], count: number) => {
    let selectedImages = arr.slice(0, count);
    // สุ่มลำดับของ selectedImages แบบสุ่ม
    selectedImages.sort(() => Math.random() - 0.5);

    // ตรวจสอบและจัดเรียงใหม่หากมีภาพซ้ำติดกัน
    for (let i = 1; i < selectedImages.length; i++) {
      if (selectedImages[i] === selectedImages[i - 1]) {
        // หาอันที่ไม่ซ้ำเพื่อสลับตำแหน่ง
        for (let j = i + 1; j < selectedImages.length; j++) {
          if (selectedImages[j] !== selectedImages[i - 1]) {
            // สลับตำแหน่ง
            [selectedImages[i], selectedImages[j]] = [
              selectedImages[j],
              selectedImages[i],
            ];
            break;
          }
        }
      }
    }
    return selectedImages;
  };
  const [isStarted, setIsStarted] = useState(false);
  const [finsih, setFinsh] = useState(false);
  const [randomImages, setRandomImages] = useState<StudentOnSubject[]>(
    students.length >= 30
      ? shuffleWithNoAdjacentDuplicates(students, 30)
      : shuffleWithNoAdjacentDuplicates(
          [
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
            ...students,
          ],
          30,
        ),
  );

  useEffect(() => {
    setSelectItem(randomImages[1]);
  }, []);

  const handleOpenModal = () => {
    setRandomImages((prev) => {
      const newRandoms =
        prev.length >= 30
          ? shuffleWithNoAdjacentDuplicates(prev, 30)
          : shuffleWithNoAdjacentDuplicates(
              [
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
                ...prev,
              ],
              30,
            );
      setSelectItem(newRandoms[1]);
      return newRandoms;
    });

    setIsStarted((prev) => !prev);
    setFinsh(false);
  };

  const handleRemoveAndStartAgain = () => {
    const studentRemoveId = randomImages[1].id;
    handleRemoveStudent(studentRemoveId);
    setFinsh(false);
    setIsStarted(false);
  };

  const handleRemoveStudent = (id: string) => {
    setRandomImages((prevs) => {
      const filterOuts = prevs.filter((prev) => prev.id !== id);
      return filterOuts;
    });
    const oldStudentsRemove = localStorageGetRemoveRandomStudents({
      subjectId: subjectId,
    });
    let newStudentsRemove: { id: string }[] = [];
    const isExist = oldStudentsRemove?.find((item) => item.id === id);
    if (!isExist) {
      newStudentsRemove = [...(oldStudentsRemove ?? []), { id: id }];
    } else {
      newStudentsRemove = oldStudentsRemove ?? [];
    }
    setStudentRemoveList(newStudentsRemove);
    localStorageSetRemoveRandomStudents({
      subjectId: subjectId,
      studentIds: newStudentsRemove,
    });
  };

  const handleAddStudent = (id: string) => {
    const student = studentOnSubjects.data?.find((s) => s.id === id);
    if (!student) {
      return;
    }
    let students = studentOnSubjects.data
      ?.filter((s) => s.isActive)
      .filter((s) => !studentRemoveList.some((r) => r.id === s.id));
    if (!students) {
      return;
    }
    const updateRemoveList = studentRemoveList.filter((s) => s.id !== id);
    students = [...(students ?? []), student];
    setRandomImages(() => {
      const newRandoms =
        students.length >= 30
          ? shuffleWithNoAdjacentDuplicates(students, 30)
          : shuffleWithNoAdjacentDuplicates(
              [
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
                ...students,
              ],
              30,
            );
      setSelectItem(newRandoms[1]);
      return newRandoms;
    });

    localStorageSetRemoveRandomStudents({
      subjectId: subjectId,
      studentIds: updateRemoveList.map((s) => ({ id: s.id })),
    });
    setStudentRemoveList(updateRemoveList);
  };

  const handleRestart = () => {
    const students =
      studentOnSubjects.data?.filter((s) => s.isActive) ??
      ([] as StudentOnSubject[]);
    if (!students) {
      return;
    }

    setRandomImages(() => {
      const newRandoms =
        students.length >= 30
          ? shuffleWithNoAdjacentDuplicates(students as StudentOnSubject[], 30)
          : shuffleWithNoAdjacentDuplicates(
              [
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
                ...(students as StudentOnSubject[]),
              ],
              30,
            );
      setSelectItem(newRandoms[1]);
      return newRandoms;
    });
    localStorageSetRemoveRandomStudents({
      subjectId: subjectId,
      studentIds: [],
    });
    setStudentRemoveList([]);
    setIsStarted((prev) => !prev);
    setFinsh(false);
  };

  const handleCloseModal = () => {
    document.body.style.overflow = "auto";
    setSelectFooter("EMTY");
  };

  const handleFast = () => SetSpeedUp(3);
  const handleSlow = () => SetSpeedUp(1);

  return (
    <>
      {selectItem && triggerScore && (
        <PopupLayout
          onClose={() => {
            setTriggerScore(false);
          }}
        >
          <PopUpStudent
            student={selectItem}
            toast={toast}
            onClose={() => {
              setTriggerScore(false);
            }}
          />
        </PopupLayout>
      )}
      <div className="relative flex h-full w-full flex-col lg:w-full lg:max-w-none lg:flex-row">
        <button
          onClick={handleCloseModal}
          className="absolute right-0 top-0 z-10 rounded-full p-1 hover:bg-gray-100"
        >
          <IoCloseOutline size={24} />
        </button>
        <div className="flex w-full flex-col gap-2 pt-10 lg:w-3/4">
          {finsih && selectItem ? (
            <div className="relative flex h-80 min-w-full max-w-full flex-col items-center justify-center gap-2 bg-white lg:min-w-[42rem] lg:max-w-2xl">
              <h1 className="text-2xl font-bold">Congratulations!</h1>
              <div className="relative h-40 w-40 overflow-hidden rounded bg-gray-100">
                <Image
                  key={`${selectItem?.id}`}
                  src={selectItem?.photo}
                  placeholder="blur"
                  blurDataURL={decodeBlurhashToCanvas(
                    selectItem?.blurHash ?? defaultBlurHash,
                  )}
                  alt={`Scroll item`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain"
                />
              </div>
              <h1 className="text-lg font-semibold">
                {selectItem?.firstName} {selectItem?.lastName}
              </h1>
              <h1 className="text-lg font-normal text-gray-500">
                Number {selectItem?.number}
              </h1>
              <div className="flex w-full justify-center gap-2">
                <button
                  onClick={() => {
                    setFinsh(false);
                    setIsStarted(false);
                  }}
                  className="second-button flex h-10 w-40 items-center justify-center border"
                >
                  BACK
                </button>
                <button
                  onClick={() => {
                    setTriggerScore(true);
                  }}
                  className="flex h-10 w-40 items-center justify-center rounded-2xl border bg-green-400 text-black"
                >
                  SCORE
                </button>
                <button
                  onClick={() => handleRemoveAndStartAgain()}
                  className="reject-button flex h-10 w-40 items-center justify-center"
                >
                  REMOVE
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-80 flex-col gap-2">
              {randomImages.length === 0 && (
                <div className="relative flex h-full min-w-full items-center justify-center overflow-hidden rounded bg-gray-100 lg:min-w-[42rem]">
                  No student found
                </div>
              )}
              {randomImages.length > 0 && (
                <AnimationCard<StudentOnSubject>
                  randomImages={randomImages}
                  onPassPointer={() => {
                    if (ding) {
                      if (!ding.paused) {
                        ding.pause(); // Stop the current audio if it's playing
                        ding.currentTime = 1; // Reset to the beginning
                      }
                      ding
                        .play()
                        .catch((error) =>
                          console.error("Playback error:", error),
                        );
                    }
                  }}
                  onStart={(start) => {}}
                  onFinished={() => {
                    setIsStarted(false);
                    cheering?.play();
                    setTimeout(() => {
                      setFinsh(true);
                    }, 1000);
                  }}
                  isStarted={isStarted}
                  speedUp={speedUp}
                />
              )}
              <div className="z-10 flex w-full justify-center gap-2">
                <button
                  disabled={isStarted || randomImages.length === 0}
                  onClick={handleOpenModal}
                  onMouseOver={handleFast}
                  className="main-button flex h-10 w-40 items-center justify-center"
                >
                  {isStarted ? (
                    <ProgressSpinner
                      animationDuration="1s"
                      style={{ width: "20px" }}
                      className="h-5 w-5"
                      strokeWidth="8"
                    />
                  ) : (
                    "FAST"
                  )}
                </button>
                <button
                  disabled={isStarted || randomImages.length === 0}
                  onClick={handleOpenModal}
                  onMouseOver={handleSlow}
                  className="main-button flex h-10 w-40 items-center justify-center"
                >
                  {isStarted ? (
                    <ProgressSpinner
                      animationDuration="1s"
                      style={{ width: "20px" }}
                      className="h-5 w-5"
                      strokeWidth="8"
                    />
                  ) : (
                    "SLOW"
                  )}
                </button>
                <button
                  disabled={isStarted}
                  onClick={handleRestart}
                  className="second-button flex h-10 w-40 items-center justify-center border"
                >
                  {isStarted ? (
                    <ProgressSpinner
                      animationDuration="1s"
                      style={{ width: "20px" }}
                      className="h-5 w-5"
                      strokeWidth="8"
                    />
                  ) : (
                    "RESTART"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        <ManageList
          onClickAdd={(id) => {
            handleAddStudent(id);
          }}
          onClickRemove={(id) => handleRemoveStudent(id)}
          studentRemoveList={studentRemoveList}
          studentOnSubjects={studentOnSubjects}
        />
      </div>
    </>
  );
};

export default SilderPicker;

type ManageListProps = {
  studentRemoveList: {
    id: string;
  }[];
  studentOnSubjects: UseQueryResult<StudentOnSubject[], Error>;
  onClickRemove: (id: string) => void;
  onClickAdd: (id: string) => void;
};
const ManageList = memo(
  ({
    studentRemoveList,
    studentOnSubjects,
    onClickRemove,
    onClickAdd,
  }: ManageListProps) => {
    const [selectMenu, setSelectMenu] = useState<"available" | "remove">(
      "remove",
    );
    return (
      <div className="flex w-80 items-center justify-center lg:justify-start">
        <div className="mt-5 h-80 w-full max-w-xs pl-5 sm:max-w-full lg:mt-0 lg:w-full lg:max-w-none lg:border-l">
          <div className="flex h-7 w-full border-collapse items-center justify-center gap-1 border-b">
            <button
              onClick={() => setSelectMenu("available")}
              className={`text-base ${
                selectMenu === "available" && "border-b-2 border-black"
              } `}
            >
              Available List
            </button>
            <div className="h-7 w-[1px] bg-gray-400" />
            <button
              onClick={() => setSelectMenu("remove")}
              className={`text-base ${
                selectMenu === "remove" && "border-b-2 border-black"
              } `}
            >
              Remove List
            </button>
          </div>
          <ul className="h-72 overflow-y-auto">
            {selectMenu === "remove" &&
              studentRemoveList.map((student, index) => {
                const image = studentOnSubjects.data?.find(
                  (img) => img.id === student.id,
                );
                if (!image) {
                  return <></>;
                }
                const odd = index % 2 === 0;
                return (
                  <StudentCard
                    button={
                      <button
                        onClick={() => onClickAdd(student.id)}
                        className="success-button flex items-center justify-center p-1"
                      >
                        <IoPersonAdd />
                      </button>
                    }
                    key={index}
                    odd={odd}
                    index={index}
                    image={image}
                  />
                );
              })}
            {selectMenu === "available" &&
              studentOnSubjects.data
                ?.filter((s) => s.isActive)
                .filter((s) => !studentRemoveList.some((r) => r.id === s.id))
                .map((student, index) => {
                  const odd = index % 2 === 0;

                  return (
                    <StudentCard
                      button={
                        <button
                          onClick={() => onClickRemove(student.id)}
                          className="reject-button flex items-center justify-center p-1"
                        >
                          <IoPersonRemove />
                        </button>
                      }
                      key={index}
                      odd={odd}
                      index={index}
                      image={student}
                    />
                  );
                })}
          </ul>
        </div>
      </div>
    );
  },
);

const StudentCard = memo(
  <StudentOnSubject extends AnimationImageItemProps>({
    image,
    index,
    odd,
    button,
  }: {
    image: StudentOnSubject;
    index: number;
    odd: boolean;
    button: React.ReactNode;
  }) => {
    return (
      <li
        key={`${image.id}-${index}`}
        className={`flex items-center justify-between gap-2 p-2 ${
          odd ? "bg-white" : "bg-gray-100"
        } `}
      >
        <div className="flex items-center justify-center gap-2">
          {index + 1}
          <div className="relative h-10 w-10">
            <Image
              src={image.photo}
              alt={`Scroll item ${index}`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-semibold">
              {image.firstName} {image.lastName}
            </h1>
            <h1 className="text-sm font-normal text-gray-500">
              Number {image.number}
            </h1>
          </div>
        </div>
        {button}
      </li>
    );
  },
);

StudentCard.displayName = "StudentCard";
ManageList.displayName = "ManageList";
