import Image from "next/image";
import { memo } from "react";
import { defaultBlurHash } from "../../data";
import { classroomUiLanguage } from "../../data/languages";
import { Student } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import { studentDisplayName } from "../../utils/studentRoster";
import RowActionsMenu, { RowAction } from "../common/RowActionsMenu";

type Props = {
  student: Student;
  onOpen: () => void;
  actions: RowAction[];
  busy?: boolean;
};

function StudentRosterRow({ student, onOpen, actions, busy }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const name = studentDisplayName(student);

  return (
    <li
      aria-busy={busy || undefined}
      className={`flex items-center gap-1 pr-2 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-background-color/60 ${
        busy ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-2.5 pl-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-color/30 sm:pl-4"
      >
        <span className="w-8 shrink-0 text-right text-sm tabular-nums text-icon-color/50">
          {student.number}
        </span>
        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-background-color ring-1 ring-icon-color/10">
          {student.photo && (
            <Image
              src={student.photo}
              alt=""
              fill
              sizes="40px"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash,
              )}
              className="object-cover"
            />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate font-medium text-icon-color">
          {name}
        </span>
      </button>
      <RowActionsMenu
        label={classroomUiLanguage.moreActions(lang, student.firstName)}
        actions={actions}
        disabled={busy}
      />
    </li>
  );
}

export default memo(StudentRosterRow);
