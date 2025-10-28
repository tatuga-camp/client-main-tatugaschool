import React, { HTMLInputTypeAttribute, memo } from "react";
import { SiGoogleclassroom } from "react-icons/si";

type Props = {
  icon: React.ReactNode;
  placeholder: string;
  maxLength?: number;
  minLength?: number;
  type?: HTMLInputTypeAttribute;
  title?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};
function InputWithIcon({
  icon,
  placeholder,
  maxLength = 199,
  minLength = 5,
  type,
  title,
  value,
  onChange,
  required,
}: Props) {
  return (
    <label className="flex w-full flex-col gap-1">
      {title && <span className="text-sm font-normal">{title}</span>}{" "}
      <div className="group flex h-10 w-full items-center justify-center focus:ring-2">
        <div className="flex h-full w-10 items-center justify-center rounded-l-md border border-r-0 group-hover:border-blue-500">
          {icon}
        </div>
        <input
          required={required}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 grow rounded-2xl rounded-l-none border border-l-0 outline-none group-hover:border-blue-500"
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
        />
      </div>
    </label>
  );
}

export default memo(InputWithIcon);
