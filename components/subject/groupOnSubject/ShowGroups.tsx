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
      <div className="w-full md:w-10/12 font-Anuphan lg:w-9/12  flex flex-col">
        <header className="w-full flex items-center gap-2 justify-start border-b py-2">
          <button
            onClick={() => {
              setSelectGroup(undefined);
              setTriggerCreateGroup(() => true);
            }}
            className="main-button w-40 text-xs h-full flex-col flex items-center justify-center gap-1"
          >
            <CiCirclePlus className="text-4xl" />
            Create Group
          </button>
          <div className="h-full w-[1px] bg-gray-500"></div>
          <div className="grow overflow-auto">
            <span className="text-sm">Select Group</span>
            <ul className="min-w-max flex items-center justify-start gap-2 ">
              {groups.data?.map((group, index) => {
                return (
                  <li
                    onClick={() => setSelectGroup(() => group)}
                    key={index}
                    className={`p-1
                    ${
                      group.id === selectGroup?.id
                        ? "bg-gray-100 border text-primary-color"
                        : "text-black"
                    }
                    hover:bg-gray-100 rounded-md 
                    cursor-pointer transition-colors duration-150 ease-in-out`}
                  >
                    <h3 className="text-base font-semibold max-w-40 truncate">
                      {group.title}
                    </h3>
                    <p className="text-gray-600 max-w-40 truncate text-sm">
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
