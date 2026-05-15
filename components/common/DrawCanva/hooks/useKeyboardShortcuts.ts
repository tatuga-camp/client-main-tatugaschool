import { useEffect } from "react";

type Handlers = {
  pen?: () => void;
  highlighter?: () => void;
  eraser?: () => void;
  text?: () => void;
  shape?: () => void;
  select?: () => void;
  undo?: () => void;
  redo?: () => void;
  escape?: () => void;
};

export const useKeyboardShortcuts = (handlers: Handlers, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inEditable =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (inEditable && e.key !== "Escape") return;

      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handlers.redo?.();
        else handlers.undo?.();
        return;
      }
      switch (e.key.toLowerCase()) {
        case "p":
          handlers.pen?.();
          break;
        case "h":
          handlers.highlighter?.();
          break;
        case "e":
          handlers.eraser?.();
          break;
        case "t":
          handlers.text?.();
          break;
        case "s":
          handlers.shape?.();
          break;
        case "v":
          handlers.select?.();
          break;
        case "escape":
          handlers.escape?.();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers, enabled]);
};
