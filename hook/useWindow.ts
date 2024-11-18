import { useEffect, useState, MutableRefObject } from "react";

interface Style {
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
}

const useAdjustPosition = (
  ref: MutableRefObject<HTMLElement | null>,
  padding: number = 10
): Style => {
  const [style, setStyle] = useState<Style>({});

  useEffect(() => {
    const adjustPosition = () => {
      if (ref.current) {
        const element = ref.current;
        const rect = element.getBoundingClientRect();

        const updatedStyle: Style = {};

        // Check for overflow on each side and adjust accordingly
        if (rect.left < padding) {
          updatedStyle.left = `${padding}px`;
        }
        if (rect.right > window.innerWidth - padding) {
          updatedStyle.left = `${window.innerWidth - rect.width - padding}px`;
        }
        if (rect.top < padding) {
          updatedStyle.top = `${padding}px`;
        }
        if (rect.bottom > window.innerHeight - padding) {
          updatedStyle.top = `${window.innerHeight - rect.height - padding}px`;
        }

        // Apply updated styles if needed
        if (Object.keys(updatedStyle).length > 0) {
          setStyle(updatedStyle);
        }
      }
    };

    // Adjust position on mount and when window resizes
    adjustPosition();
    window.addEventListener("resize", adjustPosition);

    return () => window.removeEventListener("resize", adjustPosition);
  }, [ref, padding]);

  return style;
};

export default useAdjustPosition;
