import { useCallback, useReducer } from "react";
import { Annotation, HistoryEntry } from "../types";

type State = {
  annotations: Annotation[];
  past: HistoryEntry[];
  future: HistoryEntry[];
};

type Action =
  | { type: "apply"; entry: HistoryEntry }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset" };

const applyForward = (
  annotations: Annotation[],
  entry: HistoryEntry,
): Annotation[] => {
  switch (entry.type) {
    case "add":
      return [...annotations, entry.annotation];
    case "remove":
      return annotations.filter((a) => a.id !== entry.annotation.id);
    case "update":
      return annotations.map((a) =>
        a.id === entry.after.id ? entry.after : a,
      );
  }
};

const applyBackward = (
  annotations: Annotation[],
  entry: HistoryEntry,
): Annotation[] => {
  switch (entry.type) {
    case "add":
      return annotations.filter((a) => a.id !== entry.annotation.id);
    case "remove":
      return [...annotations, entry.annotation];
    case "update":
      return annotations.map((a) =>
        a.id === entry.before.id ? entry.before : a,
      );
  }
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "apply":
      return {
        annotations: applyForward(state.annotations, action.entry),
        past: [...state.past, action.entry],
        future: [],
      };
    case "undo": {
      if (state.past.length === 0) return state;
      const last = state.past[state.past.length - 1];
      return {
        annotations: applyBackward(state.annotations, last),
        past: state.past.slice(0, -1),
        future: [last, ...state.future],
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        annotations: applyForward(state.annotations, next),
        past: [...state.past, next],
        future: state.future.slice(1),
      };
    }
    case "reset":
      return { annotations: [], past: [], future: [] };
  }
};

export const useDrawingHistory = () => {
  const [state, dispatch] = useReducer(reducer, {
    annotations: [],
    past: [],
    future: [],
  });

  const push = useCallback((entry: HistoryEntry) => {
    dispatch({ type: "apply", entry });
  }, []);

  const add = useCallback((annotation: Annotation) => {
    dispatch({ type: "apply", entry: { type: "add", annotation } });
  }, []);

  const remove = useCallback((annotation: Annotation) => {
    dispatch({ type: "apply", entry: { type: "remove", annotation } });
  }, []);

  const update = useCallback((before: Annotation, after: Annotation) => {
    dispatch({ type: "apply", entry: { type: "update", before, after } });
  }, []);

  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  return {
    annotations: state.annotations,
    push,
    add,
    remove,
    update,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
};
