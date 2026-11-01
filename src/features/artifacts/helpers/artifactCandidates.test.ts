// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { getArtifactCandidates, recognizeArtifactFromGridCell } from "./recognizeArtifactFromGridCell";
import { ARTIFACT_CONFIDENCE_THRESHOLD } from "./artifactPrediction";

const { run } = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock("onnxruntime-web", () => ({
  Tensor: class {
    dispose() {}
  },
  InferenceSession: {
    create: vi.fn(async () => ({ inputNames: ["input"], outputNames: ["output"], run })),
  },
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("retains all original scores below the acceptance threshold and reuses them in the picker", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => ({
      ok: true,
      json: async () => (url.includes("labels") ? ["legendary-01", "legendary-29", "mythic-01"] : {}),
    })),
  );
  vi.stubGlobal(
    "Image",
    class {
      width = 80;
      height = 80;
      onload?: () => void;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: vi.fn(),
    getImageData: () => ({ data: new Uint8ClampedArray(128 * 128 * 4) }),
  } as unknown as CanvasRenderingContext2D);
  run.mockImplementation(async () => ({ output: { data: new Float32Array([1, 1.1, 0.9]), dispose: vi.fn() } }));
  const cell = { row: 0, col: 0, bounds: { x: 0, y: 0, width: 80, height: 80 }, imageUrl: "data:cell" };
  const recognized = await recognizeArtifactFromGridCell(cell);
  expect(recognized?.confidence).toBeLessThan(ARTIFACT_CONFIDENCE_THRESHOLD);
  const calls = run.mock.calls.length;
  const candidates = await getArtifactCandidates(cell);
  expect(candidates.map((candidate) => candidate.artifactId)).toEqual(["legendary-01", "legendary-29", "mythic-01"]);
  expect(candidates[0].confidence).toBeCloseTo(0.33222);
  expect(candidates[1].confidence).toBeCloseTo(0.36717);
  expect(run).toHaveBeenCalledTimes(calls);
});
