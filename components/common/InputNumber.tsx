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
};
function InputNumber({
  value,
  onValueChange,
  min,
  max,
  useGrouping,
  required,
}: Props) {
  return (
    <InputNumberPrimereact
      required={required}
      value={value}
      min={min}
      useGrouping={useGrouping}
      max={max}
      onValueChange={(e) => onValueChange(e.value as number)}
      pt={{
        root: {
          className: " inline-flex",
        },
        input: {
          root(options) {
            return { className: "main-input" };
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
