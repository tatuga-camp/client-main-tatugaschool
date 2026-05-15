import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import parse from "html-react-parser";
import React from "react";
import {
  ModeType,
  StampAnnotation,
  StickyAnnotation,
  TextAnnotation,
} from "./types";

type DraggableInner = TextAnnotation | StampAnnotation | StickyAnnotation;

type Props = {
  obj: DraggableInner;
  mode: ModeType;
  currentEditId: string | null;
  onActivate: (id: string) => void;
};

const stampGlyph = (symbol: StampAnnotation["symbol"]): string => {
  switch (symbol) {
    case "check":
      return "✓";
    case "cross":
      return "✗";
    case "star":
      return "★";
    case "smile":
      return "☺";
  }
};

export const DraggableAnnotation: React.FC<Props> = ({
  obj,
  mode,
  currentEditId,
  onActivate,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: obj.id,
  });

  const isEditing = currentEditId === obj.id && mode === "text-edit";
  const isMouseMode = mode === "mouse";

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: obj.x,
    top: obj.y,
    transform: CSS.Translate.toString(transform),
    cursor: isMouseMode ? "move" : "default",
    pointerEvents: isEditing ? "none" : "auto",
    userSelect: "none",
  };

  if (obj.kind === "text") {
    const style: React.CSSProperties = {
      ...baseStyle,
      color: obj.color,
      fontSize: `${obj.fontSize}px`,
      border: isMouseMode ? "1px dashed rgba(0,0,0,0.2)" : "none",
      padding: "2px 4px",
      borderRadius: 4,
      maxWidth: 600,
      whiteSpace: "pre-wrap",
    };
    return (
      <p
        ref={setNodeRef}
        style={style}
        onDoubleClick={() => {
          if (isMouseMode) onActivate(obj.id);
        }}
        {...attributes}
        {...listeners}
      >
        {parse(obj.text.replace(/\n/g, "<br />"))}
      </p>
    );
  }

  if (obj.kind === "stamp") {
    const style: React.CSSProperties = {
      ...baseStyle,
      color: obj.color,
      fontSize: `${obj.size}px`,
      lineHeight: 1,
      filter: isMouseMode
        ? "drop-shadow(0 0 0.5px rgba(0,0,0,0.4))"
        : undefined,
    };
    return (
      <span
        ref={setNodeRef}
        style={style}
        onDoubleClick={() => {
          if (isMouseMode) onActivate(obj.id);
        }}
        {...attributes}
        {...listeners}
      >
        {stampGlyph(obj.symbol)}
      </span>
    );
  }

  // sticky
  const style: React.CSSProperties = {
    ...baseStyle,
    width: obj.width,
    minHeight: obj.height,
    background: obj.bgColor,
    color: obj.textColor,
    padding: 12,
    borderRadius: 8,
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
    fontSize: 14,
    lineHeight: 1.35,
    whiteSpace: "pre-wrap",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      onDoubleClick={() => {
        if (isMouseMode) onActivate(obj.id);
      }}
      {...attributes}
      {...listeners}
    >
      {obj.text || "Add note…"}
    </div>
  );
};
