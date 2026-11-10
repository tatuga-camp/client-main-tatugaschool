import { useCallback, useEffect, useRef, useState } from "react";
import type { EliminationPlan } from "../../../utils/treasure-picker";

export type RunPhase = "idle" | "running" | "done";

export type EliminationRun = {
  phase: RunPhase;
  /** Students still in the chest. */
  alive: Set<string>;
  /** About to vanish: lit for a beat before they go. */
  doomed: Set<string>;
  winners: string[];
  start: (plan: EliminationPlan, everyone: string[]) => void;
  /** Back to idle with a fresh chest. */
  reset: (everyone: string[]) => void;
  /** Jump straight to the result. */
  skip: () => void;
};

type Options = {
  /** A step's students vanished; `progress` runs 0 → 1 over the run. */
  onStep?: (progress: number) => void;
  onDone?: (winners: string[]) => void;
  reducedMotion?: boolean;
};

/** Plays an EliminationPlan on a timer chain; the plan already holds the winners. */
export function useEliminationRun(
  initial: string[],
  { onStep, onDone, reducedMotion = false }: Options = {},
): EliminationRun {
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [alive, setAlive] = useState<Set<string>>(() => new Set(initial));
  const [doomed, setDoomed] = useState<Set<string>>(() => new Set());
  const [winners, setWinners] = useState<string[]>([]);

  const timers = useRef<number[]>([]);
  const planRef = useRef<EliminationPlan | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const cbs = useRef({ onStep, onDone });
  cbs.current = { onStep, onDone };

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const finish = useCallback((plan: EliminationPlan) => {
    clear();
    planRef.current = null;
    phaseRef.current = "done";
    setAlive(new Set(plan.winners));
    setDoomed(new Set());
    setPhase("done");
    cbs.current.onDone?.(plan.winners);
  }, []);

  const reset = useCallback((everyone: string[]) => {
    clear();
    planRef.current = null;
    phaseRef.current = "idle";
    setPhase("idle");
    setAlive(new Set(everyone));
    setDoomed(new Set());
    setWinners([]);
  }, []);

  const start = useCallback(
    (plan: EliminationPlan, everyone: string[]) => {
      if (phaseRef.current !== "idle") return;
      clear();
      planRef.current = plan;
      phaseRef.current = "running";
      setAlive(new Set(everyone));
      setDoomed(new Set());
      setWinners(plan.winners);
      setPhase("running");

      if (reducedMotion || plan.steps.length === 0) {
        finish(plan);
        return;
      }

      const left = new Set(everyone);
      const last = plan.steps.length - 1;
      let at = 350; // a breath before the first cut
      plan.steps.forEach((step, i) => {
        at += step.delay;
        const litMs = Math.round(
          Math.min(520, Math.max(30, step.delay * 0.55)),
        );
        timers.current.push(
          window.setTimeout(() => setDoomed(new Set(step.ids)), at),
        );
        at += litMs;
        timers.current.push(
          window.setTimeout(() => {
            step.ids.forEach((id) => left.delete(id));
            setAlive(new Set(left));
            setDoomed(new Set());
            cbs.current.onStep?.(last === 0 ? 1 : i / last);
          }, at),
        );
      });
      timers.current.push(window.setTimeout(() => finish(plan), at + 650));
    },
    [reducedMotion, finish],
  );

  const skip = useCallback(() => {
    const plan = planRef.current;
    if (plan && phaseRef.current === "running") finish(plan);
  }, [finish]);

  return { phase, alive, doomed, winners, start, reset, skip };
}
