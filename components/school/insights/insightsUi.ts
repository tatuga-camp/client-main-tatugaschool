// Shared color language for the School Insights surface.
// Every class here is built from the project's tailwind theme tokens
// (primary-color, info/success/warning/error-color, icon-color).

export type Palette = {
  text: string; // readable text color class
  chip: string; // soft background chip class
  bar: string; // solid fill for progress bars
};

// Rate-based semantic palette (0..1). Higher is better.
export function ratePalette(rate: number): Palette {
  if (rate >= 0.9)
    return {
      text: "text-success-color",
      chip: "bg-success-color/10",
      bar: "bg-success-color",
    };
  if (rate >= 0.75)
    return {
      text: "text-info-color",
      chip: "bg-info-color/10",
      bar: "bg-info-color",
    };
  if (rate >= 0.5)
    return {
      // warning yellow is low-contrast as text, so use the dark icon color on a soft chip
      text: "text-icon-color",
      chip: "bg-warning-color/20",
      bar: "bg-warning-color",
    };
  return {
    text: "text-error-color",
    chip: "bg-error-color/10",
    bar: "bg-error-color",
  };
}

// Risk tier badge.
export function tierBadge(tier: "HIGH" | "MEDIUM"): string {
  return tier === "HIGH"
    ? "bg-error-color text-white"
    : "bg-warning-color text-icon-color";
}

// Score-bucket solid fill: failing band red, borderline bands yellow, the rest brand blue.
export function bucketBar(bucket: string): string {
  switch (bucket) {
    case "0-49":
      return "bg-error-color";
    case "50-59":
    case "60-69":
      return "bg-warning-color";
    default:
      return "bg-primary-color";
  }
}

// Rank badge for leaderboards: first place in brand color, the rest neutral.
export function rankBadge(index: number): string {
  return index === 0
    ? "bg-primary-color text-white"
    : "bg-gray-100 text-gray-600";
}
