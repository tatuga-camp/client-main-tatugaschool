import Image from "next/image";
import Link from "next/link";
import { TbFileDownload } from "react-icons/tb";
import { defaultBlurHash } from "../../../data";
import { gradeData, gradeTableData } from "../../../data/languages";
import { Language, StudentOnSubject } from "../../../interfaces";
import { decodeBlurhashToCanvas } from "../../../utils";

function completionStyle(percentage: number | null): string {
  if (percentage === null) return "text-gray-400";
  if (percentage === 100) return "bg-success-color/10 text-success-color";
  if (percentage >= 50) return "bg-warning-color/20 text-amber-700";
  return "bg-error-color/10 text-error-color";
}

function GradeStudentCell({
  student,
  subjectId,
  completionPercentage,
  language,
}: {
  student: StudentOnSubject;
  subjectId: string;
  completionPercentage: number | null;
  language: Language;
}) {
  return (
    <td className="sticky left-0 z-20 border-b border-r border-gray-100 bg-white p-0 group-hover:bg-background-color">
      <div className="flex h-11 w-24 items-center justify-between gap-2 px-1.5 md:h-14 md:w-80 md:px-3">
        {/* On phones the name opens the report; from md the hover icon does. */}
        <Link
          href={`/subject/${subjectId}/reports/${student.id}`}
          target="_blank"
          title={`${student.firstName} ${student.lastName}`}
          className="flex min-w-0 items-center gap-3 md:pointer-events-none"
        >
          <div className="relative hidden h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200 md:block">
            <Image
              src={student.photo}
              alt={student.firstName}
              fill
              sizes="36px"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash,
              )}
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-icon-color md:text-sm">
              {student.firstName} {student.lastName}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 md:gap-2 md:text-xs">
              <span className="shrink-0">
                {gradeTableData.number(language)} {student.number}
              </span>
              <span
                className={`w-max rounded-full px-1 text-[10px] md:px-1.5 md:text-[11px] ${completionStyle(completionPercentage)}`}
              >
                {completionPercentage === null ? (
                  "—"
                ) : (
                  <>
                    {completionPercentage}%
                    <span className="hidden md:inline">
                      {" "}
                      {gradeData.graded(language)}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>
        </Link>
        <Link
          href={`/subject/${subjectId}/reports/${student.id}`}
          target="_blank"
          title={gradeTableData.report(language)}
          aria-label={gradeTableData.report(language)}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl text-icon-color transition hover:bg-white md:flex md:opacity-0 md:group-hover:opacity-100"
        >
          <TbFileDownload />
        </Link>
      </div>
    </td>
  );
}

export default GradeStudentCell;
