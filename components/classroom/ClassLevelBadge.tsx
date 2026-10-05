import { memo } from "react";
import { useGetLanguage } from "../../react-query";
import { shortGradeLabel, splitLevel } from "../../utils/classLevel";

type Props = {
  level: string | null | undefined;
  archived?: boolean;
  size?: "md" | "lg";
};

// Square stand-in for a photo: classrooms show their level, subjects show
// a picture, so the two lists never look alike.
function ClassLevelBadge({ level, archived = false, size = "md" }: Props) {
  const language = useGetLanguage();
  const { grade, room } = splitLevel(level);
  const label = shortGradeLabel(grade, language.data ?? "en");
  const fullLevel = (level ?? "").trim() || "–";

  return (
    <span
      role="img"
      aria-label={fullLevel}
      title={fullLevel}
      className={`flex shrink-0 flex-col items-center justify-center rounded-2xl font-bold leading-tight ${
        size === "lg" ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm"
      } ${
        archived
          ? "bg-icon-color/10 text-icon-color/60"
          : "bg-primary-color/10 text-primary-color"
      }`}
    >
      <span className="max-w-full truncate px-1">{label}</span>
      {room && (
        <span
          className={`max-w-full truncate px-1 font-semibold opacity-80 ${
            size === "lg" ? "text-sm" : "text-xs"
          }`}
        >
          /{room}
        </span>
      )}
    </span>
  );
}

export default memo(ClassLevelBadge);
