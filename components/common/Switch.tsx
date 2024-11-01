import { InputSwitch } from "primereact/inputswitch";
import { classNames } from "primereact/utils";
import React from "react";

type Props = {
  checked: boolean | undefined;
  setChecked: (data: boolean) => void;
  disabled?: boolean;
};
function Switch({ checked, setChecked, disabled = false }: Props) {
  return (
    <InputSwitch
      disabled={disabled}
      checked={checked ?? false}
      onChange={(e) => setChecked(e.value)}
      pt={{
        root: (option) => ({
          className: classNames("inline-block relative", "w-12 h-7", {
            "opacity-60 select-none pointer-events-none cursor-default":
              option?.props.disabled,
          }),
        }),
        input: {
          className: classNames(
            "absolute appearance-none top-0 left-0 size-full p-0 m-0 opacity-0 z-10 outline-none cursor-pointer"
          ),
        },
        slider: (option) => ({
          className: classNames(
            "absolute cursor-pointer top-0 left-0 right-0 bottom-0 border border-transparent",
            "transition-colors duration-200 rounded-2xl",
            "focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)] ",
            "before:absolute before:content-'' before:top-1/2 before:bg-white before:w-5 before:h-5 before:left-1 before:-mt-2.5 before:rounded-full before:transition-duration-200",
            {
              "bg-gray-200  hover:bg-gray-300  ": !option?.props.checked,
              "bg-blue-500 before:transform before:translate-x-5":
                option?.props.checked,
            }
          ),
        }),
      }}
    />
  );
}

export default Switch;
