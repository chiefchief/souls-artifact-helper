// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ArtifactGalleryModal, LegendaryCountGuideModal } from "./modals";

beforeEach(() => {
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("scrollX", 0);
  vi.stubGlobal("scrollY", 420);
  vi.stubGlobal("innerWidth", 1020);
  vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1000);
});

afterEach(() => {
  cleanup();
  document.body.removeAttribute("style");
  document.documentElement.removeAttribute("style");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("artifact modal page scrolling", () => {
  it.each(["Crafted artifacts", "Artifacts I can craft"])(
    "keeps the page still behind %s and restores it on close",
    (title) => {
      document.body.style.paddingRight = "4px";
      document.body.style.overflow = "auto";
      const modal = render(<ArtifactGalleryModal artifacts={[]} title={title} onClose={vi.fn()} />);
      expect(document.body.style.position).toBe("fixed");
      expect(document.body.style.top).toBe("-420px");
      expect(document.body.style.paddingRight).toBe("24px");
      expect(document.documentElement.style.overflow).toBe("hidden");
      expect(window.scrollTo).not.toHaveBeenCalled();
      if (title === "Artifacts I can craft") {
        fireEvent.click(screen.getByRole("button", { name: "PVP" }));
        expect(document.body.style.top).toBe("-420px");
        expect(window.scrollTo).not.toHaveBeenCalled();
      }
      modal.unmount();
      expect(document.body.style.position).toBe("");
      expect(document.body.style.overflow).toBe("auto");
      expect(document.body.style.paddingRight).toBe("4px");
      expect(document.documentElement.style.overflow).toBe("");
      expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({ left: 0, top: 420, behavior: "instant" });
    },
  );

  it("keeps scrolling locked until all artifact modals have closed", () => {
    const gallery = render(<ArtifactGalleryModal artifacts={[]} title="Crafted artifacts" onClose={vi.fn()} />);
    const guide = render(<LegendaryCountGuideModal onClose={vi.fn()} />);
    gallery.unmount();
    expect(document.body.style.position).toBe("fixed");
    expect(window.scrollTo).not.toHaveBeenCalled();
    guide.unmount();
    expect(document.body.style.position).toBe("");
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });
});
