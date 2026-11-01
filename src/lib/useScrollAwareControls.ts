import { useEffect, useState, type RefObject } from "react";

export function useScrollAwareControls(controlsRef: RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState({ isStuck: false, isHidden: false });

  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    let anchorY = lastY;
    let direction = 0;
    let hidden = false;

    function update() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        // Modal scroll locks temporarily reset window.scrollY. Do not interpret
        // that change as a gesture on the page behind the modal.
        if (document.body.style.position === "fixed") return;
        const y = Math.max(
          0,
          Math.min(window.scrollY, Math.max(0, document.documentElement.scrollHeight - window.innerHeight)),
        );
        const isStuck = (controlsRef.current?.getBoundingClientRect().top ?? 1) <= 0;
        const nextDirection = Math.sign(y - lastY);
        if (nextDirection && nextDirection !== direction) {
          anchorY = lastY;
          direction = nextDirection;
        }
        if (!isStuck || !window.matchMedia("(max-width: 767px)").matches || y === 0) {
          hidden = false;
          anchorY = y;
        } else if (!controlsRef.current?.querySelector(":focus-visible")) {
          if (direction > 0 && y - anchorY >= 20) hidden = true;
          if (direction < 0 && anchorY - y >= 8) hidden = false;
        }
        lastY = y;
        setState((current) =>
          current.isStuck === isStuck && current.isHidden === hidden ? current : { isStuck, isHidden: hidden },
        );
      });
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [controlsRef]);

  return state;
}
