export type ModeType =
  | "draw"
  | "highlighter"
  | "eraser"
  | "shape"
  | "text"
  | "text-edit"
  | "stamp"
  | "sticky"
  | "mouse";

export type ShapeKind = "arrow" | "rect" | "ellipse";

export type StampSymbol = "check" | "cross" | "star" | "smile";

export type StrokeAnnotation = {
  kind: "stroke";
  id: string;
  points: number[][];
  color: string;
  size: number;
  isEraser: boolean;
  isHighlighter: boolean;
};

export type TextAnnotation = {
  kind: "text";
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
};

export type ShapeAnnotation = {
  kind: "shape";
  id: string;
  shape: ShapeKind;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  thickness: number;
};

export type StampAnnotation = {
  kind: "stamp";
  id: string;
  x: number;
  y: number;
  symbol: StampSymbol;
  size: number;
  color: string;
};

export type StickyAnnotation = {
  kind: "sticky";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  bgColor: string;
  textColor: string;
};

export type Annotation =
  | StrokeAnnotation
  | TextAnnotation
  | ShapeAnnotation
  | StampAnnotation
  | StickyAnnotation;

export type HistoryEntry =
  | { type: "add"; annotation: Annotation }
  | { type: "remove"; annotation: Annotation }
  | { type: "update"; before: Annotation; after: Annotation };

export const newId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
