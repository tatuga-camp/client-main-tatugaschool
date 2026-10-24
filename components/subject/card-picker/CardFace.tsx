import Image from "next/image";
import { useEffect } from "react";
import { CardPickerLanguage } from "../../../data/languages";
import { Language, StudentOnSubject } from "../../../interfaces";
import { mascotForPhoto, reactMascot } from "../../../utils/mascot";
import MascotAvatar from "../../student/MascotAvatar";

/** next/image throws on an empty src, so fall back to the first initial. */
export function StudentPhoto({
  student,
  className,
}: {
  student: StudentOnSubject;
  className: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-primary-color/10 ${className}`}
    >
      {student.photo ? (
        <Image
          src={student.photo}
          alt=""
          fill
          sizes="128px"
          className="object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-bold text-primary-color">
          {/* Skip Thai leading vowels (เ แ โ ใ ไ) so the initial is a consonant. */}
          {student.firstName.replace(/^[เแโใไ]/, "").charAt(0)}
        </span>
      )}
    </div>
  );
}

export default function CardFace({
  student,
  lang,
  revealed = false,
}: {
  student: StudentOnSubject;
  lang: Language;
  /** True once the card has flipped face-up; the mascot cheers then. */
  revealed?: boolean;
}) {
  const mascot = mascotForPhoto(student.photo);

  useEffect(() => {
    if (revealed && mascot) reactMascot(student.id, "happy");
  }, [revealed, mascot, student.id]);

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center rounded-2xl border-4 border-white bg-white pb-3 shadow-[0_24px_50px_rgba(0,0,0,0.35)] ${
        mascot ? "px-0 pt-5" : "px-3 pt-9"
      }`}
    >
      <span className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-warning-color px-3 py-1 text-xs font-extrabold text-icon-color shadow">
        ★ {student.totalSpeicalScore} {CardPickerLanguage.points_short(lang)}
      </span>
      {mascot ? (
        // Full-body mascot instead of the round photo, so it can jump.
        <div className="relative aspect-square w-full">
          <span
            aria-hidden
            className="absolute inset-3 rounded-full bg-primary-color/10"
          />
          <MascotAvatar
            id={student.id}
            clips={mascot}
            alt={student.firstName}
            tapToPlay
            sizes="208px"
          />
        </div>
      ) : (
        <StudentPhoto
          student={student}
          className="h-28 w-28 border-4 border-primary-color/15 text-4xl md:h-32 md:w-32"
        />
      )}
      <span className={`${mascot ? "mt-auto" : "mt-4"} text-sm text-icon-color/60`}>
        {CardPickerLanguage.number_label(lang, student.number)}
      </span>
    </div>
  );
}
