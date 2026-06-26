import React from "react";
import type { FaceBox } from "../../../hook/useFaceDetector";
import { headRegion, toPixelBox } from "./overlayMath";

type FaceOverlayProps = {
  faces: FaceBox[];
  renderWidth: number;
  renderHeight: number;
  mirrored: boolean;
  highlightIndex: number | null;
  isWinner: boolean;
};

export default function FaceOverlay({
  faces,
  renderWidth,
  renderHeight,
  mirrored,
  highlightIndex,
  isWinner,
}: FaceOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {faces.map((face, i) => {
        // Highlight the head, not the whole body, so the scan reads as a
        // student picker rather than a body-box tracker.
        const px = toPixelBox(
          headRegion(face),
          renderWidth,
          renderHeight,
          mirrored,
        );
        const highlighted = i === highlightIndex;
        const border = highlighted
          ? isWinner
            ? "border-success-color"
            : "border-primary-color"
          : "border-white/70";
        return (
          <div
            key={i}
            className={`absolute rounded-xl border-4 transition-all duration-75 ${border} ${
              highlighted ? "shadow-[0_0_24px_rgba(0,0,0,0.5)]" : ""
            } ${highlighted && isWinner ? "scale-105" : ""}`}
            style={{
              left: px.left,
              top: px.top,
              width: px.width,
              height: px.height,
            }}
          />
        );
      })}
    </div>
  );
}
