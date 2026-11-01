import { useEffect } from "react";

let lockCount = 0;
let restorePage: (() => void) | undefined;

/** Keep the page at its current position until the last open modal closes. */
export function usePageScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      const { body, documentElement } = document;
      const { scrollX, scrollY } = window;
      const previous = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        width: body.style.width,
        overflow: body.style.overflow,
        paddingRight: body.style.paddingRight,
      };
      const previousRootOverflow = documentElement.style.overflow;
      const scrollbarWidth = Math.max(0, window.innerWidth - documentElement.clientWidth);
      const paddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

      Object.assign(body.style, {
        position: "fixed",
        top: `${-scrollY}px`,
        left: `${-scrollX}px`,
        width: "100%",
        overflow: "hidden",
        paddingRight: `${paddingRight + scrollbarWidth}px`,
      });
      documentElement.style.overflow = "hidden";

      restorePage = () => {
        Object.assign(body.style, previous);
        documentElement.style.overflow = previousRootOverflow;
        window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
      };
    }

    lockCount++;
    return () => {
      lockCount--;
      if (lockCount === 0) {
        restorePage?.();
        restorePage = undefined;
      }
    };
  }, [active]);
}
