import React, { memo, SyntheticEvent, use, useRef, useState } from "react";
import { Calendar as CalendarPrimereact } from "primereact/calendar";
import { FormEvent, Nullable } from "primereact/ts-helpers";
import { CgClose } from "react-icons/cg";
import { classNames } from "primereact/utils";

type Props = {
  value: Nullable<(Date | null)[]>;
  onValue: (value: Nullable<(Date | null)[]>) => void;
};

const TRANSITIONS = {
  overlay: {
    timeout: 150,
    classNames: {
      enter: "opacity-0 scale-75",
      enterActive:
        "opacity-100 !scale-100 transition-transform transition-opacity duration-150 ease-in",
      exit: "opacity-100",
      exitActive: "!opacity-0 transition-opacity duration-150 ease-linear",
    },
  },
};

function Calendar({ value, onValue }: Props) {
  const [data, setData] = useState<Nullable<(Date | null)[]>>(value);

  return (
    <div className="flex flex-col w-full h-full ">
      <label className="text-xs text-gray-500">Select Date</label>
      <div className="relative w-max ">
        <CalendarPrimereact
          dateFormat="dd/mm/yy"
          value={data}
          onChange={(event) => {
            setData(event.value);
            onValue(event.value);
          }}
          selectionMode="range"
          readOnlyInput
          pt={{
            root: (option) => ({
              className: classNames("inline-flex  relative", {
                "opacity-60 select-none pointer-events-none cursor-default":
                  option?.props.disabled,
              }),
            }),
            input: (option) => ({
              root: {
                className: classNames(
                  "font-sans text-base text-gray-600 w-60  bg-white  p-3 border border-gray-300  transition-colors duration-200 appearance-none",
                  "hover:border-blue-500",
                  {
                    "rounded-lg": !option?.props.showIcon,
                    "border-r-0 rounded-l-lg": option?.props.showIcon,
                  }
                ),
              },
            }),
            panel: (option) => ({
              className: classNames("bg-white", "min-w-96", {
                "shadow-md border-0 absolute": !option?.props.inline,
                "inline-block overflow-x-auto border border-gray-300  p-2 rounded-lg":
                  option?.props.inline,
              }),
            }),
            header: {
              className: classNames(
                "flex items-center justify-between",
                "p-2 text-gray-700  bg-white  font-semibold m-0 border-b border-gray-300  rounded-t-lg"
              ),
            },
            previousButton: {
              className: classNames(
                "flex items-center justify-center cursor-pointer overflow-hidden relative",
                "w-8 h-8 text-gray-600  border-0 bg-transparent rounded-full transition-colors duration-200 ease-in-out",
                "hover:text-gray-700  hover:border-transparent hover:bg-gray-200  "
              ),
            },
            title: { className: "leading-8 mx-auto" },
            monthTitle: {
              className: classNames(
                "text-gray-700  transition duration-200 font-semibold p-2",
                "mr-2",
                "hover:text-blue-500"
              ),
            },
            yearTitle: {
              className: classNames(
                "text-gray-700  transition duration-200 font-semibold p-2",
                "hover:text-blue-500"
              ),
            },
            nextButton: {
              className: classNames(
                "flex items-center justify-center cursor-pointer overflow-hidden relative",
                "w-8 h-8 text-gray-600  border-0 bg-transparent rounded-full transition-colors duration-200 ease-in-out",
                "hover:text-gray-700  hover:border-transparent hover:bg-gray-200  "
              ),
            },
            table: {
              className: classNames("border-collapse w-full", "my-2"),
            },
            tableHeaderCell: { className: "p-2" },
            weekDay(options) {
              return {
                className: classNames("text-gray-600 "),
              };
            },
            day: { className: "p-2" },
            dayLabel: (option) => ({
              className: classNames(
                "w-10 h-10 rounded-full transition-shadow duration-200 border-transparent border",
                "flex items-center justify-center mx-auto overflow-hidden relative",
                "focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)] ",
                {
                  "opacity-60 cursor-default": option?.context.disabled,
                  "cursor-pointer": !option?.context.disabled,
                },
                {
                  "text-gray-600  bg-transprent hover:bg-gray-200 ":
                    !option?.context.selected && !option?.context.disabled,
                  "text-blue-700 bg-blue-100 hover:bg-blue-200":
                    option?.context.selected && !option?.context.disabled,
                }
              ),
            }),
            monthPicker: { className: "my-2" },
            month: (option) => ({
              className: classNames(
                "w-1/3 inline-flex items-center justify-center cursor-pointer overflow-hidden relative",
                "p-2 transition-shadow duration-200 rounded-lg",
                "focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)] ",
                {
                  "text-gray-600  bg-transprent hover:bg-gray-200 ":
                    !option?.context.selected && !option?.context.disabled,
                  "text-blue-700 bg-blue-100 hover:bg-blue-200":
                    option?.context.selected && !option?.context.disabled,
                }
              ),
            }),
            yearPicker: {
              className: classNames("my-2"),
            },
            year: (option) => ({
              className: classNames(
                "w-1/2 inline-flex items-center justify-center cursor-pointer overflow-hidden relative",
                "p-2 transition-shadow duration-200 rounded-lg",
                "focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)] ",
                {
                  "text-gray-600  bg-transprent hover:bg-gray-200 ":
                    !option?.context.selected && !option?.context.disabled,
                  "text-blue-700 bg-blue-100 hover:bg-blue-200":
                    option?.context.selected && !option?.context.disabled,
                }
              ),
            }),
            timePicker: {
              className: classNames(
                "flex justify-center items-center",
                "border-t-1 border-solid border-gray-300 p-2"
              ),
            },
            separatorContainer: {
              className: "flex items-center flex-col px-2",
            },
            separator: { className: "text-xl" },
            hourPicker: { className: "flex items-center flex-col px-2" },
            minutePicker: { className: "flex items-center flex-col px-2" },
            ampmPicker: { className: "flex items-center flex-col px-2" },
            incrementButton: {
              className: classNames(
                "flex items-center justify-center cursor-pointer overflow-hidden relative",
                "w-8 h-8 text-gray-600  border-0 bg-transparent rounded-full transition-colors duration-200 ease-in-out",
                "hover:text-gray-700  hover:border-transparent hover:bg-gray-200  "
              ),
            },
            decrementButton: {
              className: classNames(
                "flex items-center justify-center cursor-pointer overflow-hidden relative",
                "w-8 h-8 text-gray-600  border-0 bg-transparent rounded-full transition-colors duration-200 ease-in-out",
                "hover:text-gray-700  hover:border-transparent hover:bg-gray-200  "
              ),
            },
            groupContainer: { className: "flex" },
            group: {
              className: classNames(
                "flex-1",
                "border-l border-gray-300 pr-0.5 pl-0.5 pt-0 pb-0",
                "first:pl-0 first:border-l-0"
              ),
            },
            transition: TRANSITIONS.overlay,
          }}
        />
        <button
          onClick={() => {
            setData(null);
            onValue(null);
          }}
          className="absolute hover:bg-gray-300/50 w-6 h-6 right-2 z-20 top-0 bottom-0 m-auto rounded-md active:bg-gray-400  flex 
    items-center justify-center  text-gray-600"
        >
          <CgClose />
        </button>
      </div>
    </div>
  );
}

export default memo(Calendar);
