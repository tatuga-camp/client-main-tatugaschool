import React from "react";
import { InputNumber as InputNumberPrimereact } from "primereact/inputnumber";
import { classNames } from "primereact/utils";

type Props = {
  value?: number;
  onValueChange: (data: number) => void;
  min: number;
  max: number;
  useGrouping?: boolean;
  required?: boolean;
  suffix?: string;
  prefix?: string;
  disabled?: boolean;
  placeholder?: string;
  minFractionDigits?: number;
  maxFractionDigits?: number;
};
function InputNumber({
  value,
  onValueChange,
  min,
  max,
  useGrouping,
  required,
  suffix,
  placeholder,
  prefix,
  disabled,
  minFractionDigits,
  maxFractionDigits,
}: Props) {
  return (
    <InputNumberPrimereact
      suffix={suffix}
      prefix={prefix}
      required={required}
      disabled={disabled}
      minFractionDigits={minFractionDigits}
      maxFractionDigits={maxFractionDigits}
      value={value}
      min={min}
      placeholder={placeholder}
      useGrouping={useGrouping}
      max={max}
      onValueChange={(e) => onValueChange(e.value as number)}
      pt={{
        root: {
          className: " inline-flex w-full",
        },
        input: {
          root(options) {
            return { className: "main-input  w-full" };
          },
        },
        buttonGroup(options) {
          return {
            className: classNames({
              "flex flex-col":
                options?.props.showButtons &&
                options?.props.buttonLayout == "stacked",
            }),
          };
        },
        incrementButton(option) {
          return {
            className: classNames("flex !items-center !justify-center", {
              "rounded-br-none rounded-bl-none rounded-bl-none !p-0 flex-1 w-[3rem]":
                option?.props.showButtons &&
                option?.props.buttonLayout == "stacked",
            }),
          };
        },
        decrementButton(option) {
          return {
            className: classNames("flex !items-center !justify-center", {
              "rounded-tr-none rounded-tl-none rounded-tl-none !p-0 flex-1 w-[3rem]":
                option?.props.showButtons &&
                option?.props.buttonLayout == "stacked",
            }),
          };
        },
      }}
    />
  );
}

export default InputNumber;
