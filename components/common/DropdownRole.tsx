import React from "react";
import { GoChevronDown } from "react-icons/go";
import { MemberRole } from "../../interfaces";
import useClickOutside from "../../hook/useClickOutside";
type Pops = {
  disabled?: boolean;
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
  disabled,
}: Pops) {
  const devRef = React.useRef<HTMLDivElement>(null);
  useClickOutside(devRef, () => {
    setTrigger(() => false);
  });
  return (
    <>
      <button
        disabled={disabled}
        type="button"
        onClick={() => {
          setTrigger(true);
        }}
        className="rounded-2xll flex w-24 items-center justify-center gap-1 bg-gray-200/50 py-1 text-sm transition hover:bg-gray-300/50"
      >
        {selectRole}
        {!disabled && <GoChevronDown />}
      </button>
      {trigger && (
        <div
          ref={devRef}
          className="absolute right-10 top-12 z-10 h-max w-60 rounded-2xl border bg-white drop-shadow"
        >
          {listRoles.map((role) => (
            <div
              onClick={() => {
                setSelectRole(role.title as MemberRole);
                setTrigger(false);
              }}
              key={role.title}
              className="w-full cursor-pointer border-b p-2 text-sm hover:bg-gray-300/50"
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
