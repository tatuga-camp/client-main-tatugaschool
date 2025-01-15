import { ProgressBar } from "primereact/progressbar";
import React from "react";

function LoadingBar() {
  return (
    <ProgressBar
      mode="indeterminate"
      style={{ height: "6px", width: "100%" }}
    />
  );
}

export default LoadingBar;
