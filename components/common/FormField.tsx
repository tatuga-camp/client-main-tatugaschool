import React from "react";
import { MdErrorOutline } from "react-icons/md";

// Shared look for text inputs on the sign-up and school-setup forms. Error
// state swaps the border and focus ring to the error color.
export const fieldInputClass = (hasError?: boolean) =>
  `h-12 w-full rounded-xl border bg-white px-4 text-base text-icon-color outline-none transition-[border-color,box-shadow] placeholder:text-icon-color/40 disabled:cursor-not-allowed disabled:bg-background-color disabled:text-icon-color/60 ${
    hasError
      ? "border-error-color focus:ring-4 focus:ring-error-color/15"
      : "border-icon-color/15 hover:border-icon-color/30 focus:border-primary-color focus:ring-4 focus:ring-primary-color/15"
  }`;

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  className?: string;
  children: React.ReactNode;
};

export const FormField = ({
  id,
  label,
  hint,
  error,
  className,
  children,
}: FormFieldProps) => (
  <div className={`flex min-w-0 flex-col gap-1.5 text-left ${className ?? ""}`}>
    <label htmlFor={id} className="text-sm font-medium text-icon-color">
      {label}
    </label>
    {children}
    {error ? (
      <p
        id={`${id}-error`}
        role="alert"
        className="flex items-start gap-1.5 text-sm text-error-color"
      >
        <MdErrorOutline aria-hidden className="mt-0.5 shrink-0" />
        {error}
      </p>
    ) : (
      hint && (
        <p id={`${id}-hint`} className="text-sm text-icon-color/60">
          {hint}
        </p>
      )
    )}
  </div>
);

// aria-describedby value that matches whichever helper line is rendered.
export const describedBy = (id: string, error?: string | null, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
