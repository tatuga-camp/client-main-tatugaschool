import { ProgressSpinner } from "primereact/progressspinner";
import React from "react";

function LoadingSpinner() {
  return (
    <ProgressSpinner
      animationDuration="1s"
      style={{ width: "20px" }}
      className="w-5 h-5"
      strokeWidth="8"
    />
  );
}

export default LoadingSpinner;
