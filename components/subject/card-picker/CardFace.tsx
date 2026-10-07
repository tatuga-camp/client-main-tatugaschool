import Image from "next/image";
import { CardPickerLanguage } from "../../../data/languages";
import { Language, StudentOnSubject } from "../../../interfaces";

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
          {student.firstName.charAt(0)}
        </span>
      )}
    </div>
  );
}

export default function CardFace({
  student,
  lang,
}: {
  student: StudentOnSubject;
  lang: Language;
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center rounded-2xl border-4 border-white bg-white px-3 pb-3 pt-9 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-warning-color px-3 py-1 text-xs font-extrabold text-icon-color shadow">
        ★ {student.totalSpeicalScore} {CardPickerLanguage.points_short(lang)}
      </span>
      <StudentPhoto
        student={student}
        className="h-28 w-28 border-4 border-primary-color/15 text-4xl md:h-32 md:w-32"
      />
      <span className="mt-4 text-sm text-icon-color/60">
        {CardPickerLanguage.number_label(lang, student.number)}
      </span>
    </div>
  );
}
