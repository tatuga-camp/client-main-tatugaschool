import { Variants } from "framer-motion";

// Shared motion + color language for the School Insights surface.
// All colors are derived from the project's tailwind theme tokens
// (primary-color, secondary-color, info/success/warning/error-color, icon-color).

export const containerStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 24 },
  },
};

export type Palette = {
  text: string; // readable text color class
  chip: string; // soft background chip class
  bar: string; // solid fill for progress bars
  grad: string; // gradient stops for hero / fills
};

// Rate-based semantic palette (0..1). Higher is better.
export function ratePalette(rate: number): Palette {
  if (rate >= 0.9)
    return {
      text: "text-success-color",
      chip: "bg-success-color/10",
      bar: "bg-success-color",
      grad: "from-success-color to-success-color/60",
    };
  if (rate >= 0.75)
    return {
      text: "text-info-color",
      chip: "bg-info-color/10",
      bar: "bg-info-color",
      grad: "from-info-color to-secondary-color",
    };
  if (rate >= 0.5)
    return {
      // warning yellow is low-contrast as text, so use the dark icon color on a soft chip
      text: "text-icon-color",
      chip: "bg-warning-color/20",
      bar: "bg-warning-color",
      grad: "from-warning-color to-warning-color/60",
    };
  return {
    text: "text-error-color",
    chip: "bg-error-color/10",
    bar: "bg-error-color",
    grad: "from-error-color to-error-color/60",
  };
}

// Risk tier visual language.
export function tierBadge(tier: "HIGH" | "MEDIUM"): string {
  return tier === "HIGH"
    ? "bg-error-color text-white"
    : "bg-warning-color text-icon-color";
}
export function tierBar(tier: "HIGH" | "MEDIUM"): string {
  return tier === "HIGH" ? "bg-error-color" : "bg-warning-color";
}
export function tierAccent(tier: "HIGH" | "MEDIUM"): string {
  return tier === "HIGH"
    ? "from-error-color/10 to-transparent"
    : "from-warning-color/15 to-transparent";
}

// Score-bucket gradient (red -> green left to right).
export function bucketGradient(bucket: string): string {
  switch (bucket) {
    case "0-49":
      return "from-error-color to-error-color/60";
    case "50-59":
      return "from-warning-color to-warning-color/60";
    case "60-69":
      return "from-warning-color to-success-color/50";
    case "70-79":
      return "from-info-color to-info-color/60";
    case "80-89":
      return "from-secondary-color to-info-color/60";
    case "90-100":
      return "from-success-color to-success-color/60";
    default:
      return "from-primary-color to-secondary-color";
  }
}

// Rank medal colors for leaderboards (1st/2nd/3rd, then default).
export function rankBadge(index: number): string {
  if (index === 0) return "bg-warning-color text-icon-color"; // gold
  if (index === 1) return "bg-gray-300 text-icon-color"; // silver
  if (index === 2) return "bg-warning-color/40 text-icon-color"; // bronze-ish
  return "bg-primary-color/10 text-primary-color";
}
