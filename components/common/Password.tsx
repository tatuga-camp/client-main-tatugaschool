import React, {
  ChangeEventHandler,
  HTMLAttributes,
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
} from "react";
import { Password as PasswordPrimereact } from "primereact/password";
import { classNames } from "primereact/utils";

interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
  accept?: string | undefined;
  alt?: string | undefined;
  autoComplete?: HTMLInputAutoCompleteAttribute | undefined;
  capture?: boolean | "user" | "environment" | undefined; // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
  checked?: boolean | undefined;
  disabled?: boolean | undefined;
  enterKeyHint?:
    | "enter"
    | "done"
    | "go"
    | "next"
    | "previous"
    | "search"
    | "send"
    | undefined;
  form?: string | undefined;
  formAction?: string | undefined;
  formEncType?: string | undefined;
  formMethod?: string | undefined;
  formNoValidate?: boolean | undefined;
  formTarget?: string | undefined;
  height?: number | string | undefined;
  list?: string | undefined;
  max?: number | string | undefined;
  maxLength?: number | undefined;
  min?: number | string | undefined;
  minLength?: number | undefined;
  multiple?: boolean | undefined;
  name?: string | undefined;
  pattern?: string | undefined;
  placeholder?: string | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  size?: number | undefined;
  src?: string | undefined;
  step?: number | string | undefined;
  type?: HTMLInputTypeAttribute | undefined;
  value?: string | readonly string[] | number | undefined;
  width?: number | string | undefined;

  onChange?: ChangeEventHandler<T> | undefined;
}

type Props = {
  toggleMask?: boolean;
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
function Password(props: InputHTMLAttributes<HTMLInputElement> & Props) {
  return (
    <PasswordPrimereact
      {...props}
      pt={{
        root: (option) => ({
          className: classNames("inline-flex relative", {
            "opacity-60 select-none pointer-events-none cursor-default":
              option?.props.disabled,
          }),
        }),
        panel: {
          className: "p-5 bg-white  text-gray-700  shadow-md rounded-md",
        },
        input: {
          className: "main-input w-80",
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
              { "pr-[2.5rem] ": options?.props.toggleMask }
            ),
          };
        },
        showIcon(options) {
          return {
            className: classNames(
              "absolute top-1/2 -mt-2",
              "right-3 text-gray-600 "
            ),
          };
        },
        hideIcon(options) {
          return {
            className: classNames(
              "absolute top-1/2 -mt-2",
              "right-3 text-gray-600 "
            ),
          };
        },
        transition: TRANSITIONS.overlay as any,
      }}
    />
  );
}

export default Password;
