import { DropdownChangeEvent, DropdownProps } from "primereact/dropdown";
import React, { memo } from "react";
import { Dropdown as DropdownPrimereact } from "primereact/dropdown";
import { classNames } from "primereact/utils";

type Props<T> = {
  value: T;
  onChange: (e: DropdownChangeEvent) => void;
  options: T[];
  placeholder: string;
  optionLabel?: string;
  valueTemplate?:
    | React.ReactNode
    | ((option: T, props: DropdownProps) => React.ReactNode)
    | undefined;
  itemTemplate?: React.ReactNode | ((option: T) => React.ReactNode) | undefined;
  loading?: boolean;
};
const TRANSITIONS = {
  overlay: {
    enterFromClass: "opacity-0 scale-75",
    enterActiveClass:
      "transition-transform transition-opacity duration-150 ease-in",
    leaveActiveClass: "transition-opacity duration-150 ease-linear",
    leaveToClass: "opacity-0",
  },
};
function Dropdown<T>({
  value,
  onChange,
  options,
  placeholder,
  optionLabel,
  valueTemplate,
  itemTemplate,
  loading,
}: Props<T>) {
  return (
    <>
      <DropdownPrimereact
        loading={loading}
        value={value}
        onChange={onChange}
        options={options}
        style={{ width: "100%" }}
        pt={{
          root: (options) => ({
            className: classNames(
              "cursor-pointer inline-flex relative select-none",
              "bg-white border border-gray-400 transition-colors duration-200 ease-in-out rounded-md",
              "w-full md:w-56",
              "hover:border-blue-500 focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]",
              {
                "opacity-60 select-none pointer-events-none cursor-default":
                  options?.props.disabled,
              }
            ),
          }),
          input: (options) => ({
            className: classNames(
              "cursor-pointer block flex flex-auto overflow-hidden overflow-ellipsis whitespace-nowrap relative",
              "bg-transparent border-0 text-gray-800",
              "p-3 transition duration-200 bg-transparent rounded appearance-none font-sans text-base",
              "focus:outline-none focus:shadow-none",
              { "pr-7": options?.props.showClear }
            ),
          }),
          trigger: {
            className: classNames(
              "flex items-center justify-center shrink-0",
              "bg-transparent text-gray-500 w-12 rounded-tr-lg rounded-br-lg"
            ),
          },
          wrapper: {
            className: classNames(
              "max-h-[200px] overflow-auto",
              "bg-white text-gray-700 border-0 rounded-md shadow-lg"
            ),
          },
          list: { className: "py-3 list-none m-0" },
          item(options) {
            return {
              className: classNames(
                "cursor-pointer font-normal overflow-hidden relative whitespace-nowrap",
                "m-0 p-3 border-0  transition-shadow duration-200 rounded-none",

                "hover:text-gray-700 hover:bg-gray-200",
                {
                  "text-gray-700":
                    options?.context.focused && options?.context.selected,
                  "bg-gray-300 text-gray-700 ":
                    options?.context.focused && options?.context.selected,
                  "bg-blue-400 text-blue-700":
                    options?.context.focused && options?.context.selected,
                  "bg-blue-50 text-blue-700 ":
                    options?.context.focused && options?.context.selected,
                  "opacity-60 select-none pointer-events-none cursor-default":
                    options?.context.disabled,
                }
              ),
            };
          },
          itemGroup(options) {
            className: classNames(
              "m-0 p-3 text-gray-800 bg-white font-bold",
              "cursor-auto"
            );
          },
          header: {
            className: classNames(
              "p-3 border-b border-gray-300 text-gray-700 bg-gray-100 mt-0 rounded-tl-lg rounded-tr-lg"
            ),
          },
          filterContainer(options) {
            return { className: "relative" };
          },
          filterInput(options) {
            return {
              className: classNames(
                "pr-7 -mr-7",
                "w-full",
                "font-sans text-base text-gray-700 bg-white py-3 px-3 border border-gray-300 transition duration-200 rounded-lg appearance-none",

                "hover:border-blue-500 focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]"
              ),
            };
          },
          filterIcon(options) {
            return {
              className: "-mt-2 absolute top-1/2",
            };
          },
          clearIcon(options) {
            return {
              className: "text-gray-500 right-12 -mt-2 absolute top-1/2",
            };
          },
          transition: TRANSITIONS.overlay as any,
        }}
        optionLabel={optionLabel}
        placeholder={placeholder}
        valueTemplate={valueTemplate}
        itemTemplate={itemTemplate}
      />
    </>
  );
}

export default memo(Dropdown) as <T>(props: Props<T>) => JSX.Element;
