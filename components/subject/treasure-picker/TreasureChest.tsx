import { animated, useSpring } from "@react-spring/web";
import { useEffect, useId } from "react";

// Gold is the theme's warning-color (#FFCD1B) with lighter / darker steps;
// the wood is the same hue pushed darker. Keyhole is icon-color.
const GOLD = "#FFCD1B";
const GOLD_LIGHT = "#FFE680";
const GOLD_DARK = "#E0A200";
const GOLD_DEEP = "#B97F00";
const WOOD = "#B5701A";
const WOOD_LIGHT = "#CC8526";
const WOOD_DARK = "#8A5210";
const INSIDE = "#5E370A";
const INK = "#383767";
const GEM = "#2C7CD1";
const GEM_LIGHT = "#569DF8";

const LID =
  "M26 106 V80 Q26 42 66 42 H174 Q214 42 214 80 V106 Z";
const SPARKLE =
  "M0 -9 C1 -2.5 2.5 -1 9 0 C2.5 1 1 2.5 0 9 C-1 2.5 -2.5 1 -9 0 C-2.5 -1 -1 -2.5 0 -9 Z";

type Props = {
  open: boolean;
  /** Bumps the chest each time this number changes (a coin dropped in). */
  pulse?: number;
  /** Open with nothing inside (everyone has been picked). */
  empty?: boolean;
  /** Closed chest rattles now and then, inviting a tap. */
  rattle?: boolean;
  reducedMotion?: boolean;
  className?: string;
};

/** Front-view treasure chest. Every moving part is SVG. */
export default function TreasureChest({
  open,
  pulse = 0,
  empty = false,
  rattle = false,
  reducedMotion = false,
  className,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const lidClip = `lid-${uid}`;
  const beam = `beam-${uid}`;
  const glow = `glow-${uid}`;

  const { o } = useSpring({
    o: open ? 1 : 0,
    config: open
      ? { tension: 260, friction: 13 }
      : { tension: 300, friction: 26 },
    immediate: reducedMotion,
  });
  const [{ b }, bump] = useSpring(() => ({ b: 0 }));
  useEffect(() => {
    if (reducedMotion || pulse === 0) return;
    bump.start({
      from: { b: 1 },
      to: { b: 0 },
      config: { tension: 420, friction: 12 },
    });
  }, [pulse, reducedMotion, bump]);

  const smil = !reducedMotion;
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

  return (
    <svg
      viewBox="0 0 240 220"
      className={className}
      style={{ overflow: "visible" }}
      aria-hidden
      focusable="false"
    >
      <defs>
        <clipPath id={lidClip}>
          <path d={LID} />
        </clipPath>
        <linearGradient id={beam} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={GOLD_LIGHT} stopOpacity="0.85" />
          <stop offset="1" stopColor={GOLD_LIGHT} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={glow} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor={GOLD_LIGHT} stopOpacity="0.7" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="205" rx="96" ry="10" fill="#000" opacity="0.22" />

      {/* Squash + stretch whenever a coin lands inside. */}
      <animated.g
        transform={b.to(
          (v) =>
            `translate(120 200) scale(${1 + 0.05 * v} ${1 - 0.07 * v}) translate(-120 -200)`,
        )}
      >
        <g>
          {smil && rattle && !open && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              dur="3.2s"
              repeatCount="indefinite"
              keyTimes="0;0.7;0.75;0.8;0.85;0.9;0.95;1"
              values="0 120 200;0 120 200;-4 120 200;4 120 200;-3 120 200;3 120 200;-1 120 200;0 120 200"
            />
          )}

          {/* Light pouring out of the open chest. */}
          <animated.path
            d="M52 104 L-10 -70 H250 L188 104 Z"
            fill={`url(#${beam})`}
            opacity={o.to((v) => (empty ? 0 : clamp01(v) * 0.55))}
          />

          {/* Inside of the lid, seen once it has swung back. */}
          <animated.g
            opacity={o.to((v) => clamp01(v * 4))}
            transform={o.to(
              (v) =>
                `translate(0 106) scale(1 ${0.7 + 0.42 * v}) translate(0 -106)`,
            )}
          >
            <path d={LID} fill={INSIDE} />
            <path
              d={LID}
              fill="none"
              stroke={GOLD_DARK}
              strokeWidth="8"
              clipPath={`url(#${lidClip})`}
            />
            <rect
              x="52"
              y="42"
              width="16"
              height="64"
              fill={WOOD_DARK}
              clipPath={`url(#${lidClip})`}
            />
            <rect
              x="172"
              y="42"
              width="16"
              height="64"
              fill={WOOD_DARK}
              clipPath={`url(#${lidClip})`}
            />
          </animated.g>

          {/* The hoard rises as the lid opens. */}
          {!empty && (
            <animated.g
              opacity={o.to((v) => clamp01(v * 3))}
              transform={o.to((v) => `translate(0 ${(1 - v) * 26})`)}
            >
              <ellipse cx="120" cy="100" rx="84" ry="34" fill={`url(#${glow})`} />
              <path
                d="M40 108 Q52 80 78 84 Q96 64 122 72 Q146 62 164 82 Q190 78 200 108 Z"
                fill={GOLD}
              />
              <path
                d="M40 108 Q52 80 78 84 Q96 64 122 72 Q146 62 164 82 Q190 78 200 108"
                fill="none"
                stroke={GOLD_LIGHT}
                strokeWidth="3"
                strokeLinecap="round"
              />
              {[
                [66, 96, 11],
                [98, 86, 13],
                [150, 88, 12],
                [178, 98, 10],
                [124, 96, 12],
              ].map(([cx, cy, r]) => (
                <g key={`${cx}-${cy}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={GOLD_LIGHT}
                    stroke={GOLD_DARK}
                    strokeWidth="2.5"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r - 5}
                    fill="none"
                    stroke={GOLD_DARK}
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                </g>
              ))}
              {/* One brand-blue gem in the gold. */}
              <g transform="translate(74 74) rotate(-14)">
                <path d="M-11 -4 L-5 -12 H5 L11 -4 L0 12 Z" fill={GEM} />
                <path d="M-11 -4 H11 L0 12 Z" fill={GEM_LIGHT} opacity="0.55" />
                <path d="M-5 -12 L-2 -4 L0 12 L2 -4 L5 -12" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
              </g>
            </animated.g>
          )}

          {/* Body. */}
          <rect x="30" y="106" width="180" height="92" rx="14" fill={WOOD} />
          <rect x="30" y="106" width="180" height="30" fill={WOOD_LIGHT} />
          <path d="M30 166 H210 V184 Q210 198 196 198 H44 Q30 198 30 184 Z" fill={WOOD_DARK} opacity="0.55" />
          <path d="M30 138 H210 M30 168 H210" stroke={WOOD_DARK} strokeWidth="2.5" opacity="0.7" />
          {[52, 172].map((x) => (
            <g key={x}>
              <rect x={x} y="106" width="16" height="92" fill={GOLD} />
              <rect x={x + 11} y="106" width="5" height="92" fill={GOLD_DARK} />
              <circle cx={x + 6} cy="150" r="3" fill={GOLD_DEEP} />
              <circle cx={x + 6} cy="182" r="3" fill={GOLD_DEEP} />
            </g>
          ))}
          <rect x="24" y="100" width="192" height="20" rx="7" fill={GOLD} />
          <rect x="24" y="113" width="192" height="7" rx="3.5" fill={GOLD_DARK} />
          <rect x="34" y="103" width="60" height="4" rx="2" fill={GOLD_LIGHT} />

          {/* Lid: lifts and folds away to show the inside. */}
          <animated.g
            opacity={o.to((v) => (v > 0.96 ? 0 : 1))}
            transform={o.to((v) => {
              const t = clamp01(v);
              return `translate(0 ${42 - 14 * t}) scale(1 ${1 - t}) translate(0 -42)`;
            })}
          >
            <path d={LID} fill={WOOD_LIGHT} />
            <g clipPath={`url(#${lidClip})`}>
              <path d="M26 74 H214" stroke={WOOD_DARK} strokeWidth="2.5" opacity="0.6" />
              <path d="M40 60 Q60 48 96 48" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.28" />
              <rect x="52" y="42" width="16" height="64" fill={GOLD} />
              <rect x="63" y="42" width="5" height="64" fill={GOLD_DARK} />
              <rect x="172" y="42" width="16" height="64" fill={GOLD} />
              <rect x="183" y="42" width="5" height="64" fill={GOLD_DARK} />
              <circle cx="58" cy="62" r="3" fill={GOLD_DEEP} />
              <circle cx="178" cy="62" r="3" fill={GOLD_DEEP} />
              <rect x="26" y="90" width="188" height="16" fill={GOLD} />
              <rect x="26" y="100" width="188" height="6" fill={GOLD_DARK} />
            </g>
            <path d={LID} fill="none" stroke={GOLD} strokeWidth="6" clipPath={`url(#${lidClip})`} />
          </animated.g>

          {/* Lock. */}
          <rect x="101" y="92" width="38" height="44" rx="10" fill={GOLD_LIGHT} stroke={GOLD_DARK} strokeWidth="3" />
          <circle cx="120" cy="109" r="6.5" fill={INK} />
          <path d="M116.5 111 H123.5 L125 125 H115 Z" fill={INK} />

          {/* Glint sweeping the lock while closed. */}
          {smil && !open && (
            <g transform="translate(134 96)">
              <path d={SPARKLE} fill="#fff">
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="0;1;0;0"
                  keyTimes="0;0.15;0.3;1"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          )}
        </g>
      </animated.g>

      {/* Twinkles around the chest. */}
      {smil &&
        (
          [
            [18, 70, 1.1, 0],
            [226, 52, 1.4, 0.7],
            [206, 150, 0.8, 1.3],
            [10, 160, 0.9, 1.9],
            [120, 14, 1.2, 0.4],
            [62, 22, 0.7, 1.6],
          ] as const
        ).map(([x, y, s, begin]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d={SPARKLE} fill={GOLD_LIGHT}>
              <animateTransform
                attributeName="transform"
                type="scale"
                values="0;1;0"
                dur="2.4s"
                begin={`${begin}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="2.4s"
                begin={`${begin}s`}
                repeatCount="indefinite"
              />
            </path>
          </g>
        ))}
    </svg>
  );
}

/** Slow gold sunburst that sits behind the chest. */
export function Sunburst({
  reducedMotion = false,
  className,
}: {
  reducedMotion?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden focusable="false">
      <defs>
        <radialGradient id={`sun-${uid}`} cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={GOLD_LIGHT} stopOpacity="0.5" />
          <stop offset="0.55" stopColor={GOLD} stopOpacity="0.14" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`halo-${uid}`} cx="0" cy="0" r="80" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={GOLD_LIGHT} stopOpacity="0.5" />
          <stop offset="1" stopColor={GOLD_LIGHT} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="80" fill={`url(#halo-${uid})`} />
      <g fill={`url(#sun-${uid})`}>
        {!reducedMotion && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="40s"
            repeatCount="indefinite"
          />
        )}
        {rays.map((a) => (
          <path key={a} d="M0 0 L-9 -100 H9 Z" transform={`rotate(${a})`} />
        ))}
      </g>
    </svg>
  );
}
