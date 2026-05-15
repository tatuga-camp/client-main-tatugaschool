import { motion } from "framer-motion";
import React, { useState } from "react";
import {
  BiHighlight,
  BiSolidEraser,
  BiSolidHand,
  BiSolidPencil,
} from "react-icons/bi";
import { BsCheckLg, BsEmojiSmile, BsStarFill, BsXLg } from "react-icons/bs";
import { MdStickyNote2, MdTextFields } from "react-icons/md";
import { TbArrowUpRight, TbOvalVertical, TbRectangle } from "react-icons/tb";
import { CommentTemplates, CommentTemplatesIcon } from "./CommentTemplates";
import { ModeType, ShapeKind, StampSymbol } from "./types";

const COLOR_PRESETS = [
  "#EF4444", // red
  "#F97316", // orange
  "#FACC15", // yellow
  "#22C55E", // green
  "#3B82F6", // blue
  "#A855F7", // purple
  "#111827", // near-black
  "#FFFFFF", // white
];

const SIZE_PRESETS: Array<{ label: "S" | "M" | "L"; size: number }> = [
  { label: "S", size: 3 },
  { label: "M", size: 8 },
  { label: "L", size: 18 },
];

type Props = {
  mode: ModeType;
  onSelectMode: (mode: ModeType) => void;
  brushColor: string;
  onBrushColorChange: (color: string) => void;
  brushRadius: number;
  onBrushRadiusChange: (radius: number) => void;
  stylusOnly: boolean;
  onToggleStylusOnly: () => void;
  shapeKind: ShapeKind;
  onSelectShapeKind: (k: ShapeKind) => void;
  stampSymbol: StampSymbol;
  onSelectStampSymbol: (s: StampSymbol) => void;
  onInsertTemplate: (text: string) => void;
};

type ToolButtonProps = {
  active: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
};

const ToolButton: React.FC<ToolButtonProps> = ({
  active,
  title,
  onClick,
  children,
}) => (
  <motion.button
    type="button"
    title={title}
    onClick={onClick}
    whileTap={{ scale: 0.9 }}
    className={[
      "flex h-11 w-11 items-center justify-center rounded-xl text-xl transition",
      active
        ? "bg-sky-500/15 text-sky-700 ring-2 ring-sky-500/40"
        : "text-gray-700 hover:bg-gray-200/70",
    ].join(" ")}
  >
    {children}
  </motion.button>
);

export const DrawToolbar: React.FC<Props> = ({
  mode,
  onSelectMode,
  brushColor,
  onBrushColorChange,
  brushRadius,
  onBrushRadiusChange,
  stylusOnly,
  onToggleStylusOnly,
  shapeKind,
  onSelectShapeKind,
  stampSymbol,
  onSelectStampSymbol,
  onInsertTemplate,
}) => {
  const [shapePopoverOpen, setShapePopoverOpen] = useState(false);
  const [stampPopoverOpen, setStampPopoverOpen] = useState(false);
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);
  const [sizePopoverOpen, setSizePopoverOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  return (
  <div className="pointer-events-auto fixed left-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-1 rounded-2xl bg-white/85 p-2 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
    <ToolButton
      active={mode === "draw"}
      title="Pen (P)"
      onClick={() => onSelectMode("draw")}
    >
      <BiSolidPencil />
    </ToolButton>
    <ToolButton
      active={mode === "highlighter"}
      title="Highlighter (H)"
      onClick={() => onSelectMode("highlighter")}
    >
      <BiHighlight />
    </ToolButton>
    <ToolButton
      active={mode === "eraser"}
      title="Eraser (E)"
      onClick={() => onSelectMode("eraser")}
    >
      <BiSolidEraser />
    </ToolButton>
    <div className="relative">
      <ToolButton
        active={mode === "shape"}
        title="Shape (S)"
        onClick={() => setShapePopoverOpen((v) => !v)}
      >
        <TbRectangle />
      </ToolButton>
      {shapePopoverOpen && (
        <div className="absolute left-12 top-0 flex gap-1 rounded-xl bg-white p-1 shadow-lg ring-1 ring-black/5">
          {(["arrow", "rect", "ellipse"] as const).map((k) => (
            <button
              key={k}
              type="button"
              title={k}
              onClick={() => {
                onSelectShapeKind(k);
                onSelectMode("shape");
                setShapePopoverOpen(false);
              }}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-lg text-lg",
                shapeKind === k && mode === "shape"
                  ? "bg-sky-500/15 text-sky-700"
                  : "hover:bg-gray-200",
              ].join(" ")}
            >
              {k === "arrow" && <TbArrowUpRight />}
              {k === "rect" && <TbRectangle />}
              {k === "ellipse" && <TbOvalVertical />}
            </button>
          ))}
        </div>
      )}
    </div>
    <div className="relative">
      <ToolButton
        active={mode === "stamp"}
        title="Stamp"
        onClick={() => setStampPopoverOpen((v) => !v)}
      >
        <BsCheckLg />
      </ToolButton>
      {stampPopoverOpen && (
        <div className="absolute left-12 top-0 flex gap-1 rounded-xl bg-white p-1 shadow-lg ring-1 ring-black/5">
          {(
            [
              { kind: "check" as const, icon: <BsCheckLg /> },
              { kind: "cross" as const, icon: <BsXLg /> },
              { kind: "star" as const, icon: <BsStarFill /> },
              { kind: "smile" as const, icon: <BsEmojiSmile /> },
            ]
          ).map(({ kind, icon }) => (
            <button
              key={kind}
              type="button"
              title={kind}
              onClick={() => {
                onSelectStampSymbol(kind);
                onSelectMode("stamp");
                setStampPopoverOpen(false);
              }}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-lg text-lg",
                stampSymbol === kind && mode === "stamp"
                  ? "bg-sky-500/15 text-sky-700"
                  : "hover:bg-gray-200",
              ].join(" ")}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
    <ToolButton
      active={mode === "text-edit" || mode === "text"}
      title="Text (T)"
      onClick={() => onSelectMode("text")}
    >
      <MdTextFields />
    </ToolButton>
    <ToolButton
      active={mode === "sticky"}
      title="Sticky note (N)"
      onClick={() => onSelectMode("sticky")}
    >
      <MdStickyNote2 />
    </ToolButton>
    <ToolButton
      active={mode === "mouse"}
      title="Select / pan (V)"
      onClick={() => onSelectMode("mouse")}
    >
      <BiSolidHand />
    </ToolButton>

    <ToolButton
      active={stylusOnly}
      title="Stylus only (ignore touch)"
      onClick={onToggleStylusOnly}
    >
      <BiSolidPencil />
      <span className="ml-0.5 text-[10px] font-semibold">only</span>
    </ToolButton>

    <div className="relative">
      <ToolButton
        active={false}
        title="Comment templates"
        onClick={() => setTemplatesOpen((v) => !v)}
      >
        <CommentTemplatesIcon />
      </ToolButton>
      <CommentTemplates
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onInsert={(text) => {
          onInsertTemplate(text);
          setTemplatesOpen(false);
        }}
      />
    </div>

    <div className="my-1 h-px w-8 bg-gray-300" />

    <div className="relative">
      <button
        type="button"
        title="Color"
        onClick={() => setColorPopoverOpen((v) => !v)}
        className="relative h-11 w-11 rounded-xl ring-1 ring-gray-300 transition hover:ring-sky-400"
      >
        <span
          className="absolute inset-1 rounded-lg"
          style={{ background: brushColor }}
        />
      </button>
      {colorPopoverOpen && (
        <div className="absolute left-12 top-0 grid w-44 grid-cols-4 gap-1 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onBrushColorChange(c);
                setColorPopoverOpen(false);
              }}
              className={[
                "h-8 w-8 rounded-lg border transition",
                brushColor.toLowerCase() === c.toLowerCase()
                  ? "ring-2 ring-sky-500"
                  : "ring-1 ring-gray-200",
              ].join(" ")}
              style={{ background: c }}
            />
          ))}
          <label className="col-span-4 mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">
            Custom
            <input
              type="color"
              value={brushColor}
              onChange={(e) => onBrushColorChange(e.target.value)}
              className="h-5 w-5 cursor-pointer"
            />
          </label>
        </div>
      )}
    </div>

    <div className="relative">
      <button
        type="button"
        title={`Size: ${brushRadius}`}
        onClick={() => setSizePopoverOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-gray-300 hover:ring-sky-400"
      >
        <span
          className="rounded-full bg-gray-700"
          style={{
            width: Math.max(4, Math.min(20, brushRadius)),
            height: Math.max(4, Math.min(20, brushRadius)),
          }}
        />
      </button>
      {sizePopoverOpen && (
        <div className="absolute left-12 top-0 flex w-48 flex-col gap-2 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5">
          <div className="flex gap-1">
            {SIZE_PRESETS.map(({ label, size }) => (
              <button
                key={label}
                type="button"
                onClick={() => onBrushRadiusChange(size)}
                className={[
                  "h-9 flex-1 rounded-lg text-sm",
                  brushRadius === size
                    ? "bg-sky-500/15 text-sky-700 ring-2 ring-sky-500/40"
                    : "bg-gray-100 hover:bg-gray-200",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={brushRadius}
            onChange={(e) => onBrushRadiusChange(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}
    </div>
  </div>
  );
};
