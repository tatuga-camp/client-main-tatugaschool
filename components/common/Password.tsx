import React, {
  ChangeEventHandler,
  HTMLAttributes,
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
} from "react";
import { Password as PasswordPrimereact } from "primereact/password";
import { classNames } from "primereact/utils";

type Props = {
  toggleMask?: boolean;
  feedback?: boolean;
  value?: string | readonly string[] | number | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  name?: string;
  placeholder?: string;
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
function Password(props: Props) {
  return (
    <PasswordPrimereact
      placeholder={props.placeholder}
      name={props.name}
      title="Password"
      required
      value={props.value}
      feedback={props.feedback}
      toggleMask={props.toggleMask}
      onChange={props.onChange}
      pt={{
        root: (option) => ({
          className: classNames("inline-flex w-full  relative", {
            "opacity-60 select-none pointer-events-none cursor-default":
              option?.props.disabled,
          }),
        }),
        iconField: {
          root: {
            style: { width: "100%" },
          },
        },
        panel: {
          className: "p-5 bg-white  text-gray-700  shadow-md rounded-2xl",
        },
        input: {
          className: "main-input w-full",
        },
        meter: {
          className: "mb-2 bg-gray-300  h-3",
        },
        meterLabel(options) {
          return {
            className: classNames(
              "transition-width duration-1000 ease-in-out h-full",
              {
                "bg-red-500": options?.state.meter?.strength == "weak",
                "bg-orange-500": options?.state.meter?.strength == "medium",
                "bg-green-500": options?.state.meter?.strength == "strong",
              },
              { "pr-[2.5rem] ": options?.props.toggleMask },
            ),
          };
        },
        showIcon(options) {
          return {
            className: classNames(
              "absolute top-1/2 -mt-2",
              "right-3 text-gray-600 ",
            ),
          };
        },
        hideIcon(options) {
          return {
            className: classNames(
              "absolute top-1/2 -mt-2",
              "right-3 text-gray-600 ",
            ),
          };
        },
        transition: TRANSITIONS.overlay as any,
      }}
    />
  );
}

export default Password;
