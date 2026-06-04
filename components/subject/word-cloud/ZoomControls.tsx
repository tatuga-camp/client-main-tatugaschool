import React from "react";
import { HiPlus, HiMinus } from "react-icons/hi";
import { MdCenterFocusStrong } from "react-icons/md";

type Props = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

const buttonClass =
  "flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-lg " +
  "text-icon-color shadow-md ring-1 ring-gray-200 transition hover:bg-white";

function ZoomControls({ onZoomIn, onZoomOut, onReset }: Props) {
  return (
    <div className="absolute bottom-4 right-4 z-40 flex flex-col gap-2">
      <button
        type="button"
        aria-label="Zoom in"
        onClick={onZoomIn}
        className={buttonClass}
      >
        <HiPlus />
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        onClick={onZoomOut}
        className={buttonClass}
      >
        <HiMinus />
      </button>
      <button
        type="button"
        aria-label="Reset view"
        onClick={onReset}
        className={buttonClass}
      >
        <MdCenterFocusStrong />
      </button>
    </div>
  );
}

export default ZoomControls;
