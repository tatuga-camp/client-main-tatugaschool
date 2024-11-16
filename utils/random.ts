export const getRandomSlateShade = (): number => {
  const shades = [200, 300, 400, 500, 600];
  const randomIndex = Math.floor(Math.random() * shades.length);
  return shades[randomIndex];
};
export const getSlateColorStyle = (shade: number): React.CSSProperties => {
  const slateColors: { [key: number]: string } = {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
  };
  return { backgroundColor: slateColors[shade] };
};
