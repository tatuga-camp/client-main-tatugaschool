import { useEffect, RefObject } from "react";

function useClickOutside(ref: RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    // Handler to detect click outside the referenced element
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(); // Call the callback if clicked outside
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

export default useClickOutside;
