import { FC, useEffect, useMemo, useState } from "react";
import { ErrorMessages, MemberOnSchool, User } from "@/interfaces";
import { LuSearch, LuSearchX, LuUserPlus, LuX } from "react-icons/lu";
import {
  useDeleteMemberOnSchool,
  useGetLanguage,
  useGetMemberOnSchoolBySchool,
  useUpdateMemberOnSchool,
} from "../../react-query";
import ListMembers from "../member/ListMembers";
import Swal from "sweetalert2";

import { ListSchoolRoles } from "../../data";
import {
  memberSectionLanguage as t,
  schoolDataLanguage,
} from "../../data/languages";

export interface MemberSectionProps {
  onInvite: () => void;
  user: User;
  schoolId: string;
}

const MemberSection: FC<MemberSectionProps> = ({
  onInvite,
  user,
  schoolId,
}) => {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const members = useGetMemberOnSchoolBySchool({ schoolId: schoolId });
  const deleteMember = useDeleteMemberOnSchool();
  const updateMember = useUpdateMemberOnSchool();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleError, setRoleError] = useState(false);
  // Local copy so a role change shows instantly; reset whenever the server
  // list changes.
  const [memberData, setMemberData] = useState<MemberOnSchool[]>(
    members.data ?? [],
  );

  useEffect(() => {
    if (members.data) setMemberData(members.data);
  }, [members.data]);

  const visibleMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return memberData;
    return memberData.filter((member) =>
      `${member.email} ${member.firstName} ${member.lastName}`
        .toLowerCase()
        .includes(q),
    );
  }, [memberData, searchTerm]);

  // Stable references so ListMembers' effect doesn't reset on every render.
  const listItems = useMemo(
    () =>
      visibleMembers.map((member) => ({
        ...member,
        isInvite: true,
        isLoading: false,
      })),
    [visibleMembers],
  );

  const counts = useMemo(
    () => ({
      admins: memberData.filter((m) => m.role === "ADMIN").length,
      teachers: memberData.filter((m) => m.role === "TEACHER").length,
      pending: memberData.filter((m) => m.status === "PENDDING").length,
    }),
    [memberData],
  );

  const handleRoleChange = async (data: {
    memberId: string;
    role: MemberOnSchool["role"];
  }) => {
    const previous = memberData;
    setRoleError(false);
    setMemberData((old) =>
      old.map((member) =>
        member.id === data.memberId ? { ...member, role: data.role } : member,
      ),
    );
    try {
      await updateMember.mutateAsync({
        query: { memberOnSchoolId: data.memberId },
        body: { role: data.role },
      });
    } catch {
      setMemberData(previous);
      setRoleError(true);
    }
  };

  const handleDeleteMemberOnSchool = async ({
    memberId,
  }: {
    memberId: string;
  }) => {
    const replacedText = "DELETE";
    let content = document.createElement("div");
    content.innerHTML =
      "<div>To confirm, type <strong>" +
      replacedText +
      "</strong> in the box below </div>";
    const { value } = await Swal.fire({
      title: "Are you sure?",
      input: "text",
      icon: "warning",
      footer: "This action is irreversible and destructive. Please be careful.",
      html: content,
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== replacedText) {
          return "Please Type Correctly";
        }
      },
    });
    if (value) {
      try {
        Swal.fire({
          title: "Deleting...",
          html: "Loading....",
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await deleteMember.mutateAsync({
          memberOnSchoolId: memberId,
        });
        Swal.fire({
          title: "Success",
          text: "Member Deleted",
          icon: "success",
        });
      } catch (error) {
        console.log(error);
        let result = error as ErrorMessages;
        Swal.fire({
          title: result?.error ? result.error : "Something Went Wrong",
          text: result?.message?.toString?.() ?? "",
          footer: result?.statusCode
            ? "Code Error: " + result.statusCode?.toString()
            : "",
          icon: "error",
        });
      }
    }
  };

  const chips = [
    { label: t.admins(lang), value: counts.admins, tone: "bg-primary-color/10 text-primary-color" },
    { label: t.teachers(lang), value: counts.teachers, tone: "bg-gray-100 text-gray-700" },
    { label: t.pending(lang), value: counts.pending, tone: "bg-warning-color/25 text-icon-color" },
  ];

  return (
    <section className="h-max w-full min-w-0 max-w-4xl rounded-2xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 p-4 sm:p-6">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            {t.title(lang)}
            {members.data && (
              <span className="rounded-full bg-primary-color/10 px-2.5 py-0.5 text-xs font-semibold text-primary-color">
                {members.data.length}
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t.subtitle(lang)}</p>
          {members.data && members.data.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${chip.tone}`}
                >
                  {chip.label} · {chip.value}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onInvite}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary-color px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-color-hover active:scale-[0.98]"
        >
          <LuUserPlus aria-hidden className="h-4 w-4" />
          {schoolDataLanguage.inviteButton(lang)}
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-4 sm:px-6">
        <label className="relative block">
          <span className="sr-only">{t.searchPlaceholder(lang)}</span>
          <LuSearch
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            placeholder={t.searchPlaceholder(lang)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-background-color py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary-color focus:bg-white focus:ring-2 focus:ring-primary-color/20"
          />
        </label>
        {roleError && (
          <p role="alert" className="mt-2 text-sm font-medium text-error-color">
            {t.roleSaveError(lang)}
          </p>
        )}
      </div>

      {/* List */}
      <div className="px-2 pb-3 pt-2 sm:px-4">
        {members.isLoading ? (
          <ul className="animate-pulse" aria-busy="true">
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 border-b border-gray-100 px-2 py-3 last:border-b-0">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 rounded bg-gray-200" />
                  <div className="h-3 w-56 rounded bg-gray-100" />
                </div>
                <div className="h-7 w-20 rounded-full bg-gray-100" />
              </li>
            ))}
          </ul>
        ) : members.isError ? (
          <div className="flex flex-col items-center py-10 text-center">
            <p className="font-semibold text-gray-900">{t.loadError(lang)}</p>
            <button
              type="button"
              onClick={() => members.refetch()}
              className="mt-3 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              {t.retry(lang)}
            </button>
          </div>
        ) : searchTerm.trim() && visibleMembers.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <LuSearchX aria-hidden className="h-9 w-9 text-gray-300" />
            <p className="mt-2 font-semibold text-gray-900">{t.noMatch(lang)}</p>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="mt-3 flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <LuX aria-hidden className="h-4 w-4" />
              {t.clearSearch(lang)}
            </button>
          </div>
        ) : (
          <ListMembers
            listRoles={ListSchoolRoles}
            members={listItems}
            user={user}
            onRoleChange={handleRoleChange}
            onDelete={handleDeleteMemberOnSchool}
            currentListMembers={memberData}
          />
        )}
      </div>
    </section>
  );
};

export default MemberSection;
