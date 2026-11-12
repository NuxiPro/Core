import * as React from "react";

// Viewport width threshold that defines mobile devices (in pixels)
const MOBILE_BREAKPOINT = 768;

/**
 * Hook that detects if the current viewport width is mobile-sized.
 * Returns true if viewport is below the breakpoint, false otherwise.
 * Updates in real-time when the window is resized.
 */
export function useIsMobile() {
  // State for tracking mobile status. Initially undefined to handle SSR safely.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // Create a media query that listens for viewport widths below the breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Callback executed whenever the media query result changes (e.g., window resize)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Register listener for viewport changes
    mql.addEventListener("change", onChange);

    // Set initial value based on current viewport width
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup: remove event listener when component unmounts
    return () => mql.removeEventListener("change", onChange);
  }, []); // Empty dependency array: effect runs once on mount only

  // Convert to boolean: undefined/false become false, true becomes true
  return !!isMobile;
}
