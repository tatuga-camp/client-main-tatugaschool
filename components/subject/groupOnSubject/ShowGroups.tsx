import { useEffect, useRef, useState } from "react";
import { useGetGroupOnSubjects, useGetLanguage } from "../../../react-query";
import { Toast } from "primereact/toast";
import { GroupOnSubject } from "../../../interfaces";
import PopupLayout from "../../layout/PopupLayout";
import GroupSetting from "./GroupSetting";
import { FiPlus } from "react-icons/fi";
import { TbUsersGroup } from "react-icons/tb";
import ShowSelectGroup from "./SelectGroup";
import { groupBoardLanguage } from "../../../data/languages";

type Props = {
  subjectId: string;
};
function ShowGroups({ subjectId }: Props) {
  const toast = useRef<Toast>(null);
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [selectGroup, setSelectGroup] = useState<GroupOnSubject | undefined>();
  const groups = useGetGroupOnSubjects({
    subjectId,
  });

  const [triggerCreateGroup, setTriggerCreateGroup] = useState<boolean>(false);

  // Keep a valid set selected: pick the first one on load, after the selected
  // set is deleted, and when the first set is created.
  useEffect(() => {
    if (!groups.data) return;
    const stillExists = groups.data.find((g) => g.id === selectGroup?.id);
    if (stillExists) {
      if (stillExists !== selectGroup) setSelectGroup(stillExists);
      return;
    }
    setSelectGroup(groups.data[0]);
  }, [groups.data]);

  return (
    <>
      {triggerCreateGroup && (
        <PopupLayout onClose={() => setTriggerCreateGroup(() => false)}>
          <GroupSetting
            onClose={() => {
              document.body.style.overflow = "auto";
              setTriggerCreateGroup(() => false);
            }}
            subjectId={subjectId}
            toast={toast}
          />
        </PopupLayout>
      )}
      <Toast ref={toast} />
      <div className="flex w-full flex-col pb-10 font-Anuphan">
        <nav className="-mx-3 flex items-center gap-2 overflow-x-auto px-3 pb-1">
          {groups.isLoading &&
            [...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-white"
              />
            ))}
          {groups.data?.map((group) => {
            const isActive = group.id === selectGroup?.id;
            return (
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelectGroup(() => group)}
                key={group.id}
                title={group.description}
                className={`h-9 max-w-52 shrink-0 truncate rounded-full border px-4 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-primary-color bg-primary-color text-white"
                    : "border-gray-200 bg-white text-icon-color hover:bg-background-color"
                }`}
              >
                {group.title}
              </button>
            );
          })}
          {groups.data && groups.data.length > 0 && (
            <button
              type="button"
              onClick={() => setTriggerCreateGroup(() => true)}
              className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-dashed border-gray-300 px-4 text-sm font-semibold text-gray-500 transition-colors hover:border-primary-color hover:text-primary-color"
            >
              <FiPlus />
              {groupBoardLanguage.newGroupSet(lang)}
            </button>
          )}
        </nav>

        {groups.data && groups.data.length === 0 && (
          <div className="mt-2 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-color/10 text-2xl text-primary-color">
              <TbUsersGroup />
            </span>
            <h2 className="text-base font-semibold text-icon-color">
              {groupBoardLanguage.emptyTitle(lang)}
            </h2>
            <p className="max-w-sm text-sm text-gray-500">
              {groupBoardLanguage.emptyHint(lang)}
            </p>
            <button
              type="button"
              onClick={() => setTriggerCreateGroup(() => true)}
              className="mt-2 flex h-10 items-center gap-1.5 rounded-xl bg-primary-color px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-color-hover"
            >
              <FiPlus />
              {groupBoardLanguage.newGroupSet(lang)}
            </button>
          </div>
        )}

        <main>
          {selectGroup && (
            <ShowSelectGroup
              key={selectGroup.id}
              onClose={() =>
                setSelectGroup(
                  groups.data?.find((g) => g.id !== selectGroup.id),
                )
              }
              toast={toast}
              subjectId={selectGroup.subjectId}
              groupOnSubjectId={selectGroup.id}
            />
          )}
        </main>
      </div>
    </>
  );
}

export default ShowGroups;
