import React from "react";
import { GoChevronDown } from "react-icons/go";
import { MemberRole } from "../../interfaces";
import useClickOutside from "../../hook/useClickOutside";
type Pops = {
  setSelectRole:
    | React.Dispatch<React.SetStateAction<MemberRole>>
    | ((role: MemberRole) => void);
  selectRole: string;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>> | (() => void);
  trigger: boolean;
  listRoles: { title: string; describe: string }[];
};
function DropdownRole({
  setSelectRole,
  selectRole,
  setTrigger,
  trigger,
  listRoles,
}: Pops) {
  const devRef = React.useRef<HTMLDivElement>(null);
  useClickOutside(devRef, () => {
    setTrigger(() => false);
  });
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setTrigger(true);
        }}
        className=" flex w-24 justify-center items-center 
gap-1 transition text-sm  py-1 rounded-md bg-gray-200/50 hover:bg-gray-300/50 "
      >
        {selectRole}
        <GoChevronDown />
      </button>
      {trigger && (
        <div
          ref={devRef}
          className="w-60 h-max rounded-md border absolute 
top-12 z-10 -right-20 bg-white drop-shadow"
        >
          {listRoles.map((role) => (
            <div
              onClick={() => {
                setSelectRole(role.title as MemberRole);
                setTrigger(false);
              }}
              key={role.title}
              className="w-full p-2 hover:bg-gray-300/50 cursor-pointer border-b text-sm"
            >
              <h1 className="font-semibold">{role.title}</h1>
              <p className="text-xs text-gray-500">{role.describe}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default DropdownRole;
