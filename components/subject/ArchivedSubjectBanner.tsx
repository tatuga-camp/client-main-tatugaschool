import Link from "next/link";
import React from "react";
import { subjectUiLanguage } from "../../data/languages";
import useGetRoleOnSchool from "../../hook/useGetRoleOnSchool";
import useGetRoleOnSubject from "../../hook/useGetRoleOnSubject";
import { useGetLanguage, useGetSubject } from "../../react-query";
import { isSubjectArchived } from "../../utils/subjectArchive";

/** Read-only notice shown on every page of an archived subject. */
function ArchivedSubjectBanner({ subjectId }: { subjectId: string }) {
  const subject = useGetSubject({ subjectId });
  const language = useGetLanguage();
  const roleSubject = useGetRoleOnSubject({ subjectId });
  const roleSchool = useGetRoleOnSchool({
    schoolId: subject.data?.schoolId ?? "",
  });
  const canManage = roleSubject === "ADMIN" || roleSchool === "ADMIN";
  if (!isSubjectArchived(subject.data)) return null;
  return (
    <div
      role="status"
      className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900"
    >
      <span>{subjectUiLanguage.archivedBanner(language.data ?? "en")}</span>
      {canManage && (
        <Link
          href={`/subject/${subjectId}?menu=SettingSubject`}
          className="font-semibold underline"
        >
          {subjectUiLanguage.archiveSubject(language.data ?? "en")}
        </Link>
      )}
    </div>
  );
}

export default ArchivedSubjectBanner;
