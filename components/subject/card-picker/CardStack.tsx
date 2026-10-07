import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type Variants,
} from "framer-motion";
import React, { useCallback, useRef } from "react";
import CardBack, { CARD_SIZE } from "./CardBack";

/** Viewport-space center and width of a card, used to launch the reveal. */
export type CardOrigin = { x: number; y: number; width: number };

export const DRAW_THRESHOLD_PX = 150;
const DRAW_VELOCITY = 800;

export const rectToOrigin = (rect: DOMRect): CardOrigin => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
  width: rect.width,
});

// Resting pose by depth (0 = top card).
const POSES = [
  { x: 0, y: 0, rotate: -1 },
  { x: 4, y: 4, rotate: 5 },
  { x: -6, y: 8, rotate: -7 },
];

type Props = {
  deckIds: string[];
  revealedId: string | null;
  canDrag: boolean;
  shuffleTick: number;
  topCardRef: React.MutableRefObject<HTMLDivElement | null>;
  onDraw: (id: string, origin: CardOrigin) => void;
};

/**
 * The face-down pile. Cards are keyed by student id — never by index — so
 * removing one card can't hand its animation state to another student.
 */
export default function CardStack({
  deckIds,
  revealedId,
  canDrag,
  shuffleTick,
  topCardRef,
  onDraw,
}: Props) {
  const visible = deckIds.slice(0, POSES.length);
  return (
    // Re-keying on shuffle remounts the pile so the cards re-deal in.
    <div key={shuffleTick} className={`relative ${CARD_SIZE}`}>
      <AnimatePresence custom={revealedId}>
        {[...visible].reverse().map((id) => {
          const depth = visible.indexOf(id);
          return (
            <StackCard
              key={id}
              id={id}
              depth={depth}
              canDrag={canDrag && depth === 0}
              topCardRef={topCardRef}
              onDraw={onDraw}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function StackCard({
  id,
  depth,
  canDrag,
  topCardRef,
  onDraw,
}: {
  id: string;
  depth: number;
  canDrag: boolean;
  topCardRef: React.MutableRefObject<HTMLDivElement | null>;
  onDraw: (id: string, origin: CardOrigin) => void;
}) {
  const x = useMotionValue(0);
  const dragRotate = useTransform(x, [-300, 300], [-15, 15]);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const pose = POSES[depth];
  const isTop = depth === 0;

  // Only claim the shared top-card ref while this card is on top, and only
  // clear it if it still points at us (an exiting card must not wipe the ref
  // the new top card just set).
  const setNode = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        nodeRef.current = node;
        if (isTop) topCardRef.current = node;
      } else {
        if (topCardRef.current === nodeRef.current) topCardRef.current = null;
        nodeRef.current = null;
      }
    },
    [isTop, topCardRef],
  );

  const variants: Variants = {
    // A drawn card vanishes instantly: the spotlight copy takes over from the
    // exact on-screen spot it was released at. Other exits fade briefly.
    exit: (revealedId: string | null) =>
      revealedId === id
        ? { opacity: 0, transition: { duration: 0 } }
        : { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: 10 - depth }}
      initial={{ opacity: 0, x: pose.x, y: pose.y + 24, rotate: pose.rotate }}
      animate={{ opacity: 1, x: pose.x, y: pose.y, rotate: pose.rotate }}
      exit="exit"
      variants={variants}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <motion.div
        ref={setNode}
        data-testid={isTop ? "top-card" : undefined}
        className={`h-full w-full touch-none select-none ${
          canDrag ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{ x, rotate: dragRotate }}
        drag={canDrag ? "x" : false}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          const passed =
            Math.abs(info.offset.x) > DRAW_THRESHOLD_PX ||
            Math.abs(info.velocity.x) > DRAW_VELOCITY;
          const node = nodeRef.current;
          if (passed && node) {
            // Measure BEFORE anything re-renders; includes the drag offset.
            onDraw(id, rectToOrigin(node.getBoundingClientRect()));
          } else {
            // We snap back ourselves instead of dragSnapToOrigin, so a card
            // that crossed the threshold never starts a return animation.
            animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
          }
        }}
      >
        <CardBack />
      </motion.div>
    </motion.div>
  );
}
