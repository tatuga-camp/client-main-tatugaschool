import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type Variants,
} from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWindowSize } from "react-use";
import { fanPoses, type FanPose } from "../../../utils/card-fan";
import CardBack from "./CardBack";

/** Viewport-space center and width of a card, used to launch the reveal. */
export type CardOrigin = { x: number; y: number; width: number };

export const DRAW_THRESHOLD_PX = 150;
const DRAW_VELOCITY = 800;

export const rectToOrigin = (rect: DOMRect): CardOrigin => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
  width: rect.width,
});

// Fan cards are smaller than the spotlight card; the reveal scales up.
const FAN_CARD = "h-44 w-32 md:h-56 md:w-40";
const cardSizeFor = (vw: number) =>
  vw >= 768 ? { w: 160, h: 224 } : { w: 128, h: 176 };

const spring = { type: "spring", stiffness: 300, damping: 28 } as const;

type Props = {
  deckIds: string[];
  revealedId: string | null;
  canDrag: boolean;
  shuffleTick: number;
  /** id → card element, so any card's on-screen position can be measured. */
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  onDraw: (id: string, origin: CardOrigin) => void;
};

/**
 * Every face-down card in the deck, fanned out so any one can be dragged out.
 * Cards are keyed by student id — never by index — so removing one card can't
 * hand its animation state to another student; the rest slide closed.
 */
export default function CardFan({
  deckIds,
  revealedId,
  canDrag,
  shuffleTick,
  cardRefs,
  onDraw,
}: Props) {
  const { width } = useWindowSize();
  const card = cardSizeFor(width);
  const poses = fanPoses(deckIds.length, width, card.w, card.h);
  const depth = poses.reduce((max, p) => Math.max(max, p.y), 0);

  return (
    // Re-keying on shuffle remounts the fan so the cards re-deal in.
    <div
      key={shuffleTick}
      className="relative w-full"
      style={{ height: card.h + depth }}
    >
      <AnimatePresence custom={revealedId}>
        {deckIds.map((id, index) => (
          <FanCard
            key={id}
            id={id}
            index={index}
            pose={poses[index]}
            cardWidth={card.w}
            canDrag={canDrag}
            cardRefs={cardRefs}
            onDraw={onDraw}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function FanCard({
  id,
  index,
  pose,
  cardWidth,
  canDrag,
  cardRefs,
  onDraw,
}: {
  id: string;
  index: number;
  pose: FanPose;
  cardWidth: number;
  canDrag: boolean;
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  onDraw: (id: string, origin: CardOrigin) => void;
}) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  // Drag offset and the fan tilt live on the SAME element: if the tilt sat on
  // a parent, dragging would move along the tilted axes, not the pointer.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const tilt = useMotionValue(pose.rotate);
  const rotate = useTransform(
    [tilt, x],
    ([t, dx]: number[]) => t + dx / 20,
  );
  useEffect(() => {
    const controls = animate(tilt, pose.rotate, spring);
    return () => controls.stop();
  }, [tilt, pose.rotate]);

  const setNode = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        nodeRef.current = node;
        cardRefs.current.set(id, node);
      } else {
        if (cardRefs.current.get(id) === nodeRef.current) {
          cardRefs.current.delete(id);
        }
        nodeRef.current = null;
      }
    },
    [id, cardRefs],
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
      className="absolute left-1/2 top-0"
      style={{ marginLeft: -cardWidth / 2, zIndex: dragging ? 999 : index }}
      initial={{ opacity: 0, x: pose.x, y: pose.y + 40 }}
      animate={{ opacity: 1, x: pose.x, y: pose.y }}
      whileHover={canDrag ? { y: pose.y - 18 } : undefined}
      exit="exit"
      variants={variants}
      transition={spring}
    >
      <motion.div
        ref={setNode}
        data-card-id={id}
        className={`${FAN_CARD} touch-none select-none ${
          canDrag ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{ x, y, rotate }}
        drag={canDrag}
        dragMomentum={false}
        onDragStart={() => setDragging(true)}
        onDragEnd={(_, info) => {
          const passed =
            Math.hypot(info.offset.x, info.offset.y) > DRAW_THRESHOLD_PX ||
            Math.hypot(info.velocity.x, info.velocity.y) > DRAW_VELOCITY;
          const node = nodeRef.current;
          if (passed && node) {
            // Measure BEFORE anything re-renders; includes the drag offset.
            onDraw(id, rectToOrigin(node.getBoundingClientRect()));
          } else {
            // We snap back ourselves instead of dragSnapToOrigin, so a card
            // that crossed the threshold never starts a return animation.
            const back = { type: "spring", stiffness: 500, damping: 30 } as const;
            animate(x, 0, back);
            animate(y, 0, back).then(() => setDragging(false));
          }
        }}
      >
        <CardBack />
      </motion.div>
    </motion.div>
  );
}
