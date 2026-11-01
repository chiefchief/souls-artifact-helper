// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollAwareControls } from "./useScrollAwareControls";

let mobile = true;
let top = 0;
let controls: HTMLDivElement;

beforeEach(() => {
  mobile = true;
  top = 0;
  controls = document.createElement("div");
  vi.spyOn(controls, "getBoundingClientRect").mockImplementation(() => ({ top }) as DOMRect);
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2400);
  vi.stubGlobal("innerHeight", 800);
  vi.stubGlobal("scrollY", 0);
  vi.stubGlobal("matchMedia", () => ({ matches: mobile }));
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  });
});

afterEach(() => {
  cleanup();
  document.body.style.position = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function scroll(y: number) {
  act(() => {
    vi.stubGlobal("scrollY", y);
    window.dispatchEvent(new Event("scroll"));
  });
}

describe("mobile inventory controls", () => {
  it("hides on downwards scroll and reappears on a small upwards scroll without flickering", () => {
    const controlsRef = { current: controls };
    const { result } = renderHook(() => useScrollAwareControls(controlsRef));
    scroll(60);
    expect(result.current.isHidden).toBe(true);
    scroll(58);
    expect(result.current.isHidden).toBe(true);
    scroll(54);
    expect(result.current.isHidden).toBe(true);
    scroll(50);
    expect(result.current.isHidden).toBe(false);
    scroll(53);
    expect(result.current.isHidden).toBe(false);
    scroll(80);
    expect(result.current.isHidden).toBe(true);
    scroll(0);
    expect(result.current.isHidden).toBe(false);
  });

  it("keeps desktop controls and controls before the sticky boundary visible", () => {
    const controlsRef = { current: controls };
    const { result } = renderHook(() => useScrollAwareControls(controlsRef));
    top = 20;
    scroll(60);
    expect(result.current).toEqual({ isStuck: false, isHidden: false });
    top = 0;
    mobile = false;
    scroll(100);
    expect(result.current).toEqual({ isStuck: true, isHidden: false });
  });

  it("ignores page position changes caused by opening and closing a modal", () => {
    const controlsRef = { current: controls };
    const { result } = renderHook(() => useScrollAwareControls(controlsRef));
    scroll(60);
    document.body.style.position = "fixed";
    scroll(0);
    expect(result.current.isHidden).toBe(true);
    document.body.style.position = "";
    scroll(60);
    expect(result.current.isHidden).toBe(true);
    scroll(50);
    expect(result.current.isHidden).toBe(false);
  });
});
