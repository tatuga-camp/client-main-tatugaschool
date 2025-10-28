import { useRef, useState } from "react";
import { useGetGroupOnSubjects } from "../../../react-query";
import { Toast } from "primereact/toast";
import { GroupOnSubject } from "../../../interfaces";
import PopupLayout from "../../layout/PopupLayout";
import GroupSetting from "./GroupSetting";
import { CiCirclePlus } from "react-icons/ci";
import ShowSelectGroup from "./SelectGroup";

type Props = {
  subjectId: string;
};
function ShowGroups({ subjectId }: Props) {
  const toast = useRef<Toast>(null);
  const [selectGroup, setSelectGroup] = useState<GroupOnSubject | undefined>();
  const groups = useGetGroupOnSubjects({
    subjectId,
  });
  const [triggerCreateGroup, setTriggerCreateGroup] = useState<boolean>(false);

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
      <div className="flex w-full flex-col font-Anuphan md:w-10/12 lg:w-9/12">
        <header className="flex w-full items-center justify-start gap-2 border-b py-2">
          <button
            onClick={() => {
              setSelectGroup(undefined);
              setTriggerCreateGroup(() => true);
            }}
            className="main-button flex h-full w-40 flex-col items-center justify-center gap-1 text-xs"
          >
            <CiCirclePlus className="text-4xl" />
            Create Group
          </button>
          <div className="h-full w-[1px] bg-gray-500"></div>
          <div className="grow overflow-auto">
            <span className="text-sm">Select Group</span>
            <ul className="flex min-w-max items-center justify-start gap-2">
              {groups.data?.map((group, index) => {
                return (
                  <li
                    onClick={() => setSelectGroup(() => group)}
                    key={index}
                    className={`p-1 ${
                      group.id === selectGroup?.id
                        ? "border bg-gray-100 text-primary-color"
                        : "text-black"
                    } cursor-pointer rounded-2xl transition-colors duration-150 ease-in-out hover:bg-gray-100`}
                  >
                    <h3 className="max-w-40 truncate text-base font-semibold">
                      {group.title}
                    </h3>
                    <p className="max-w-40 truncate text-sm text-gray-600">
                      {group.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </header>
        <main>
          {selectGroup && (
            <ShowSelectGroup
              onClose={() => setSelectGroup(undefined)}
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
