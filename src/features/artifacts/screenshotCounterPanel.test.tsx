// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ScreenshotCounterPanel } from "./screenshotCounterPanel";
import { analyzeGridSlicing, detectGridFromScreenshot } from "./helpers/screenshotGrid";
import { countArtifactsFromGridCells, defaultGridConfig } from "./screenshotCounter.v4";

vi.mock("./helpers/screenshotGrid", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./helpers/screenshotGrid")>()),
  analyzeGridSlicing: vi.fn(),
  detectGridFromScreenshot: vi.fn(),
}));
vi.mock("./screenshotCounter.v4", () => ({
  defaultGridConfig: { xRatio: 0, yRatio: 0, widthRatio: 1, heightRatio: 1, rows: 4, cols: 5, scoreThreshold: 0.58 },
  countArtifactsFromGridCells: vi.fn(async () => ({ detections: [], counts: {} })),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

function openUpload(onApplyCounts = vi.fn()) {
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("URL", { createObjectURL: () => "blob:screenshot", revokeObjectURL: vi.fn() });
  render(<ScreenshotCounterPanel onApplyCounts={onApplyCounts} />);
  fireEvent.click(screen.getByRole("button", { name: "Add artifacts from screenshot" }));
  return document.querySelector<HTMLInputElement>('input[type="file"]')!;
}

describe("screenshot grid workflow", () => {
  it("compares all source cells inline, keeps missed cells visible, and applies exclusions", async () => {
    vi.mocked(detectGridFromScreenshot).mockResolvedValue({ ...defaultGridConfig, rows: 1, cols: 3 });
    vi.mocked(analyzeGridSlicing).mockResolvedValue({
      cellPreviews: [0, 1, 2].map((col) => ({
        row: 0,
        col,
        bounds: { x: col * 80, y: 0, width: 80, height: 80 },
        imageUrl: `data:image/png;base64,source${col}`,
      })),
      gridDebug: {} as never,
    });
    vi.mocked(countArtifactsFromGridCells).mockResolvedValueOnce({
      counts: { "test-artifact": 7 },
      detections: [0, 2].map((col) => ({
        row: 0,
        col,
        artifactId: "test-artifact",
        artifactName: "Test artifact",
        quantity: col === 0 ? 2 : 5,
        score: 0.9,
        cellImageUrl: "data:image/png;base64,recognized",
      })),
    });
    const onApply = vi.fn();
    fireEvent.change(openUpload(onApply), { target: { files: [new File(["screenshot"], "inventory.png")] } });
    await screen.findByRole("button", { name: "Adjust grid" });
    const toolbar = screen.getByRole("toolbar", { name: "Screenshot actions" });
    expect(within(toolbar).getByRole("button", { name: "Adjust grid" })).toBeDefined();
    expect(within(toolbar).getByRole("button", { name: "Remove screenshot" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Close screenshot modal" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Analyze screenshot" }));
    const card = await screen.findByRole("listitem", { name: "Review row 1 column 1" });
    expect(within(card).getByRole("img", { name: "Screenshot row 1 column 1" }).getAttribute("src")).toContain(
      "source0",
    );
    expect(within(card).getByRole("img", { name: "Test artifact" }).getAttribute("src")).toContain("recognized");
    expect(within(card).getByText("Qty: 2")).toBeDefined();
    const missed = screen.getByRole("listitem", { name: "Review row 1 column 2" });
    expect(within(missed).getByRole("img", { name: "Not recognized" })).toBeDefined();
    expect(within(missed).getByRole("img", { name: "Screenshot row 1 column 2" })).toBeDefined();
    expect(screen.queryByRole("img", { name: "Screenshot preview" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show full screenshot" }));
    expect(screen.getByRole("img", { name: "Screenshot preview" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Hide full screenshot" }));
    fireEvent.click(within(card).getByRole("button", { name: "Exclude detection row 1 column 1" }));
    expect(within(card).getByText("Excluded")).toBeDefined();
    fireEvent.click(within(card).getByRole("button", { name: "Restore detection row 1 column 1" }));
    expect(within(card).getByText("Qty: 2")).toBeDefined();
    fireEvent.click(within(card).getByRole("button", { name: "Exclude detection row 1 column 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Add detected counts" }));
    expect(onApply).toHaveBeenCalledWith({ "test-artifact": 5 });
  });

  it("uses the detected grid for analysis without asking the user to configure it", async () => {
    const detected = { ...defaultGridConfig, xRatio: 0.05, yRatio: 0.2, rows: 3 };
    vi.mocked(detectGridFromScreenshot).mockResolvedValue(detected);
    vi.mocked(analyzeGridSlicing).mockResolvedValue({ cellPreviews: [], gridDebug: {} as never });
    const input = openUpload();
    const file = new File(["screenshot"], "inventory.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    await screen.findByRole("button", { name: "Adjust grid" });
    expect(screen.queryByRole("combobox", { name: "Rows" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Analyze screenshot" }));
    await waitFor(() => expect(analyzeGridSlicing).toHaveBeenCalledWith(file, detected));
    await screen.findByRole("button", { name: "Add detected counts" });
    fireEvent.click(screen.getByRole("button", { name: "Adjust grid" }));
    expect((screen.getByRole("combobox", { name: "Rows" }) as HTMLSelectElement).value).toBe("3");
    // Editing the grid invalidates results from its previous position.
    fireEvent.change(screen.getByRole("combobox", { name: "Rows" }), { target: { value: "2" } });
    expect(screen.queryByRole("button", { name: "Add detected counts" })).toBeNull();
  });

  it("offers manual controls when no reliable grid is found", async () => {
    vi.mocked(detectGridFromScreenshot).mockResolvedValue(null);
    const input = openUpload();
    fireEvent.change(input, { target: { files: [new File(["image"], "other.png")] } });
    await screen.findByText(/Could not find the grid automatically/);
    expect(screen.getByRole("combobox", { name: "Rows" })).toBeDefined();
    expect(screen.getByRole("combobox", { name: "Cols" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Hide grid controls" }));
    expect(screen.queryByRole("combobox", { name: "Rows" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Adjust grid" }));
    expect(screen.getByRole("combobox", { name: "Rows" })).toBeDefined();
  });

  it("ignores detection that finishes after the screenshot has been removed", async () => {
    let finish!: (value: typeof defaultGridConfig) => void;
    vi.mocked(detectGridFromScreenshot).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const input = openUpload();
    fireEvent.change(input, { target: { files: [new File(["image"], "first.png")] } });
    await screen.findByText("Finding artifact grid...");
    expect((screen.getByRole("button", { name: "Analyze screenshot" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Remove screenshot" }));
    finish(defaultGridConfig);
    await screen.findByText("Upload Inventory Screenshot");
    expect(screen.queryByRole("button", { name: "Adjust grid" })).toBeNull();
  });
});
