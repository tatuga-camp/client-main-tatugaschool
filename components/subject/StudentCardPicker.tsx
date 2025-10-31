import { animated, interpolate, useSprings } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useWindowSize } from "react-use";
import Swal from "sweetalert2";
import { defaultBlurHash } from "../../data";
import { StudentOnSubject } from "../../interfaces";
import { decodeBlurhashToCanvas } from "../../utils";
import { IoMdClose } from "react-icons/io";

interface StudentCardPickerProps {
  students: StudentOnSubject[];
  subjectId: string;
  onNominate: (student: StudentOnSubject) => void;
  onClose: () => void;
}
const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

function Deck({ students, onNominate, subjectId }: StudentCardPickerProps) {
  const sound = {
    cards: "https://storage.googleapis.com/tatugacamp.com/sound/card.mp3",
    sheer: "https://storage.googleapis.com/tatugacamp.com/sound/sheer.mp3",
    shuffle: "https://storage.googleapis.com/tatugacamp.com/sound/shuffle.aac",
  };
  const [gone, setGone] = useState<Set<string>>(() => new Set());
  const [shuffledStudents, setShuffledStudents] = useState<StudentOnSubject[]>(
    [],
  );

  const [loading, setLoading] = useState(false);
  const { width, height } = useWindowSize();
  const [selectedStudent, setSelectedStudent] = useState<StudentOnSubject>();
  const [activeCongrest, setActiveCongrest] = useState(false);
  const [audioSheer] = useState<HTMLAudioElement>(() => new Audio(sound.sheer));
  const [audioCard] = useState<HTMLAudioElement>(() => new Audio(sound.cards));
  const [audioShuffle] = useState<HTMLAudioElement>(
    () => new Audio(sound.shuffle),
  );

  function shuffleArray(array: StudentOnSubject[]) {
    for (let i = array?.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }

  //set random card with the first render only
  useEffect(() => {
    setShuffledStudents(() => {
      return shuffleArray(students);
    });
  }, []);

  const [props, api] = useSprings(shuffledStudents.length, (i) => ({
    ...to(i),
    from: from(i),
  })); // Create a bunch of springs using the helpers above
  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useDrag(
    ({
      args: [number, student],
      down,
      movement: [mx],
      direction: [xDir],
      velocity,
      event,
      first,
      last,
    }) => {
      const index = number as number;
      const value = student as StudentOnSubject;

      if (first) {
        audioCard.play();
      } else if (last) {
        audioCard.pause();
        audioCard.currentTime = 0;
      }
      const triggerThreshold = 200; // Trigger if dragged 200px left or right
      const trigger = Math.abs(mx) > triggerThreshold;
      const dir = xDir < 0 ? -1 : 1; // Direction should either point left or right
      if (!down && trigger) {
        gone.add(value.id);
      } // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
      api.start((i) => {
        // Only animate the card being interacted with
        if (index !== i) return;

        // A card is "gone" if it's in the set OR if it just met the trigger
        const isGone = gone.has(value.id) || (!down && trigger);

        // When a card is gone, it flies out. Otherwise, it follows the mouse or returns to 0
        const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0;
        const rot =
          mx / 100 + (isGone ? dir * 10 * (velocity[0] + velocity[1]) : 0);
        const scale = down ? 1.1 : 1; // Active cards lift up a bit
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
        };
      });
    },
  );
  const handleShowSweetAleart = (index: number | undefined) => {
    if (index === undefined) {
      Swal.fire({
        title: `เลขที่ ${selectedStudent?.number} ${selectedStudent?.firstName} ${selectedStudent?.lastName}`,
        text: "ยินดีด้วยย คุณคือผู้ถูกเลือก",
        showCancelButton: true,
        showDenyButton: true,
        denyButtonText: "ให้คะแนน",
        cancelButtonText: "ออก",
        confirmButtonText: "ลบชื่อ",
        confirmButtonColor: "#eb4034",
        cancelButtonColor: "#1be4f2",
        denyButtonColor: "#1bf278",
        width: "max-content",
      }).then((result) => {
        if (result.isConfirmed) {
          fadeOut(audioSheer, 2000);
          setActiveCongrest(() => false);
        } else if (result.dismiss) {
          fadeOut(audioSheer, 2000);
          setActiveCongrest(() => false);
        } else if (result.isDenied) {
          fadeOut(audioSheer, 2000);
          setActiveCongrest(() => false);
        }
      });
    } else if (index >= 0) {
      Swal.fire({
        title: `เลขที่ ${shuffledStudents[index]?.number} ${shuffledStudents[index]?.firstName} ${shuffledStudents[index]?.lastName}`,
        text: "ยินดีด้วยย คุณคือผู้ถูกเลือก",
        showCancelButton: true,
        showDenyButton: true,
        denyButtonText: "ให้คะแนน",
        cancelButtonText: "ออก",
        confirmButtonText: "ลบชื่อ",
        confirmButtonColor: "#eb4034",
        cancelButtonColor: "#1be4f2",
        denyButtonColor: "#1bf278",
        width: "max-content",
      }).then((result) => {
        if (result.isConfirmed) {
          fadeOut(audioSheer, 2000);
          setActiveCongrest(() => false);
        } else if (result.dismiss) {
          fadeOut(audioSheer, 2000);
          setActiveCongrest(() => false);
        } else if (result.isDenied) {
          fadeOut(audioSheer, 2000);
          setActiveCongrest(() => false);
        }
      });
    }
  };

  function fadeOut(audioElement: HTMLAudioElement, duration: number) {
    const initialVolume = audioElement.volume;
    const volumeStep = initialVolume / (duration / 100); // Adjust the division factor for the desired fade-out duration

    const fadeOutInterval = setInterval(() => {
      if (audioElement.volume > 0) {
        audioElement.volume = Math.max(audioElement.volume - volumeStep, 0);
      } else {
        audioElement.pause();
        audioElement.currentTime = 0;
        clearInterval(fadeOutInterval);
      }
    }, 100); // Adjust the interval for smoother fading
  }
  const moveStudentToDeck = (student: StudentOnSubject) => {
    setGone((prev) => {
      const newGone = new Set(prev);
      newGone.delete(student.id);
      return newGone;
    });
    const studentIndex = shuffledStudents.findIndex((s) => s.id === student.id);

    // 3. If we find the student, trigger the animation for that specific spring
    if (studentIndex !== -1) {
      api.start((i) => {
        // We are only interested in the spring at the student's index
        if (i === studentIndex) {
          // The 'to(i)' function calculates the card's resting position in the deck
          return to(i);
        }
      });
    }
  };
  console.log(gone);

  const moveStudentOutOfDeck = (student: StudentOnSubject) => {
    setGone((prev) => new Set(prev.add(student.id)));
    // 2. Find the index of this student in the springs array
    const studentIndex = shuffledStudents.findIndex((s) => s.id === student.id);

    // 3. If we find the student, trigger the fly-out animation
    if (studentIndex !== -1) {
      api.start((i) => {
        // We are only interested in the spring at the student's index
        if (i === studentIndex) {
          // Animate it off-screen (e.g., to the right)
          // We can use the same animation values from your useDrag hook
          return {
            x: window.innerWidth + 200, // Fly out to the right
            rot: 30, // Give it some rotation
            config: { friction: 50, tension: 200 }, // Use the 'isGone' config
          };
        }
      });
    }
  };
  const restart = () => {
    setShuffledStudents(() => shuffleArray(students));
    setGone(new Set());
    api.start((i) => {
      return from(i);
    });
    api.start((i) => {
      return to(i);
    });
  };
  const shuffle = () => {
    setShuffledStudents((prev) => shuffleArray(prev));
    audioShuffle.play();
    setTimeout(() => {
      audioShuffle.pause();
      audioShuffle.currentTime = 0;
    }, 500);
    api.start((i) => {
      return from(i);
    });
    api.start((i) => {
      return to(i);
    });
  };
  return (
    <div className="relative h-screen w-screen">
      <div className="absolute left-5 top-5 flex h-[calc(100vh-2.5rem)] w-80 flex-col gap-5 text-white">
        <div className="flex h-60 w-full flex-col items-center rounded-lg bg-green-500 p-3">
          <h2 className="text-lg font-semibold">
            In Deck (
            {shuffledStudents.filter((student) => !gone.has(student.id)).length}
            )
          </h2>
          <ul className="flex h-60 w-full flex-col items-start justify-start gap-2 overflow-auto p-2">
            {shuffledStudents
              .filter((student) => !gone.has(student.id))
              .map((student, index) => {
                return (
                  <li
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg bg-white p-2 text-black transition hover:bg-slate-200"
                    key={student.id}
                    onClick={() => moveStudentOutOfDeck(student)}
                  >
                    <span>
                      {student.firstName} {student.lastName}
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>
        <div className="flex h-60 w-full flex-col items-center rounded-lg bg-red-500 p-3">
          <h2 className="text-lg font-semibold">Out of Deck ({gone.size})</h2>
          <ul className="flex h-60 w-full flex-col items-start justify-start gap-2 overflow-auto p-2">
            {Array.from(gone).map((studentId, index) => {
              const student = students.find((s) => s.id === studentId);
              if (!student) return null;
              return (
                <li
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg bg-white p-2 text-black transition hover:bg-slate-200"
                  key={shuffledStudents[index].id}
                  onClick={() => moveStudentToDeck(student)}
                >
                  <span>
                    {shuffledStudents[index].firstName}{" "}
                    {shuffledStudents[index].lastName}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="card-container">
        {props.map(({ x, y, rot, scale }, i) => (
          <animated.div className="card-deck" key={i} style={{ x, y }}>
            <animated.div
              {...bind(i, shuffledStudents[i])}
              className="group relative flex h-60 w-40 touch-none select-none flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-black bg-white p-3 text-black hover:drop-shadow-md active:scale-105 sm:h-60 md:h-60 lg:h-60 xl:h-60"
              style={{
                transform: interpolate([rot, scale], trans),
              }}
            >
              <div className="absolute z-20 h-full w-full bg-white/20 backdrop-blur-md group-hover:bg-white/0 group-hover:backdrop-blur-none group-active:bg-white/0 group-active:backdrop-blur-none"></div>
              <div className="absolute -top-3 left-0 right-0 m-auto flex h-12 w-max min-w-10 max-w-20 select-none items-center justify-center rounded-2xl bg-primary-color text-white group-hover:bg-white">
                <span className="w-max max-w-14 truncate text-black group-hover:text-primary-color">
                  {shuffledStudents[i].totalSpeicalScore}
                </span>
              </div>

              <div className="relative h-20 w-20 overflow-hidden rounded-full">
                <Image
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  src={shuffledStudents[i].photo}
                  alt="Student"
                  className="pointer-events-none h-full w-full object-cover transition group-hover:scale-150"
                />
              </div>
              <div className="flex w-full select-none flex-col items-center justify-center gap-0 text-center">
                <span className="text-xs text-gray-500">
                  {shuffledStudents[i].title}
                </span>
                <h2 className="group-hover:text-blacksm:text-base w-11/12 truncate text-center text-sm font-semibold text-gray-800 md:text-lg lg:text-base">
                  {shuffledStudents[i].firstName} {shuffledStudents[i].lastName}
                </h2>
                <span className="group-hover:text-blacksm:text-sm text-xs font-medium text-gray-500 md:text-sm">
                  Number {shuffledStudents[i].number}
                </span>
              </div>
            </animated.div>
          </animated.div>
        ))}
      </div>
      <div className="absolute bottom-5 w-full">
        <div className="flex w-full items-center justify-center gap-5">
          <button
            disabled={loading}
            className="w-40 rounded-full bg-blue-500 p-3 text-xl font-semibold text-white drop-shadow-lg transition hover:scale-105 active:scale-95"
            onClick={restart}
          >
            restart
          </button>
          <button
            disabled={loading}
            onClick={shuffle}
            className="w-40 rounded-full bg-orange-500 p-3 text-xl font-semibold text-white drop-shadow-lg transition hover:scale-105 active:scale-95"
          >
            shuffle
          </button>
        </div>
      </div>
    </div>
  );
}

const StudentCardPicker: React.FC<StudentCardPickerProps> = ({
  students,
  onNominate,
  subjectId,
  onClose,
}) => {
  const [selectedStudent, setSelectedStudent] =
    useState<StudentOnSubject | null>(null);

  const handleNominate = (student: StudentOnSubject) => {
    setSelectedStudent(student);
    onNominate(student);
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-200">
      <button
        type="button"
        onClick={() => {
          document.body.style.overflow = "auto";
          onClose();
        }}
        className="fixed right-3 top-3 z-40 flex h-6 w-6 items-center justify-center rounded border-2 border-black bg-white text-lg font-semibold hover:bg-gray-300/50"
      >
        <IoMdClose />
      </button>
      {selectedStudent ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">The chosen one is</h2>
          <div className="relative h-40 w-40 overflow-hidden rounded-full">
            <Image
              src={selectedStudent.photo}
              alt={selectedStudent.firstName}
              layout="fill"
              objectFit="cover"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                selectedStudent.blurHash || defaultBlurHash,
              )}
            />
          </div>
          <h3 className="text-xl font-semibold">
            {selectedStudent.firstName} {selectedStudent.lastName}
          </h3>
        </div>
      ) : (
        <Deck
          onClose={() => {}}
          students={students}
          onNominate={handleNominate}
          subjectId={subjectId}
        />
      )}
    </div>
  );
};

export default StudentCardPicker;
