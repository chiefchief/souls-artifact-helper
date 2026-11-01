import { describe, expect, it } from "vitest";
import { detectScreenshotGrid } from "./detectScreenshotGrid";
import { getGridRowLayout } from "./screenshotGrid";
import { readFileSync } from "node:fs";
import { Jimp } from "jimp";

function inventory({
  scale = 1,
  rows = 4,
  offsetX = 20,
  offsetY = 90,
  missing = [] as number[],
  rowOffsets = [] as number[],
} = {}) {
  const width = Math.round((420 + offsetX - 20) * scale);
  const height = Math.round((rows * 78 + offsetY + 45 + Math.max(0, ...rowOffsets)) * scale);
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 30;
    data[i + 1] = 25;
    data[i + 2] = 22;
    data[i + 3] = 255;
  }
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < 5; col++) {
      if (missing.includes(row * 5 + col)) continue;
      const left = Math.round((offsetX + col * 78) * scale);
      const top = Math.round((offsetY + row * 78 + (rowOffsets[row] ?? 0)) * scale);
      const size = Math.round(68 * scale);
      for (let y = top; y < top + size; y++)
        for (let x = left; x < left + size; x++) {
          const i = (y * width + x) * 4;
          // A bright frame surrounds dark artwork with disconnected highlights.
          const edge =
            x - left < 3 * scale || y - top < 3 * scale || left + size - x <= 3 * scale || top + size - y <= 3 * scale;
          const highlight = (x + y) % 13 < 6;
          data[i] = edge ? 225 : highlight ? 150 : 10;
          data[i + 1] = edge ? 160 : highlight ? 90 : 8;
          data[i + 2] = edge ? 60 : 5;
        }
    }
  return { width, height, data };
}

describe("automatic inventory grid", () => {
  it("finds all eleven rows in the stitched screenshot, including rows below the seam", async () => {
    const image = await Jimp.read(readFileSync(new URL("./__fixtures__/stitched-inventory.png", import.meta.url)));
    const grid = detectScreenshotGrid(image.bitmap)!;
    expect(grid).not.toBeNull();
    expect(grid.rows).toBe(11);
    expect(grid.cols).toBe(5);
    expect(grid.detectedRows).toHaveLength(11);
    const first = getGridRowLayout(grid, 0);
    const last = getGridRowLayout(grid, 10);
    expect((grid.yRatio + first.topRatio * grid.heightRatio) * image.bitmap.height).toBeCloseTo(81, -1);
    expect((grid.yRatio + last.topRatio * grid.heightRatio) * image.bitmap.height).toBeCloseTo(1084, -1);
  });

  it("uses measured row positions instead of stretching a uniform grid across a stitch", () => {
    const rowOffsets = Array.from({ length: 11 }, (_, row) => (row < 7 ? 0 : 20));
    const image = inventory({ rows: 11, rowOffsets });
    const grid = detectScreenshotGrid(image)!;
    expect(grid.rows).toBe(11);
    for (let row = 0; row < 11; row++) {
      const layout = getGridRowLayout(grid, row);
      const top = (grid.yRatio + layout.topRatio * grid.heightRatio) * image.height;
      expect(top).toBeCloseTo(90 + row * 78 + rowOffsets[row], -1);
      expect(layout.heightRatio * grid.heightRatio * image.height).toBeCloseTo(68, -1);
    }
  });

  it.each([0.75, 1, 2, 4])("finds full rows at scale %s and keeps gaps out of the cells", (scale) => {
    const image = inventory({ scale });
    const grid = detectScreenshotGrid(image);
    expect(grid).not.toBeNull();
    expect(grid?.cols).toBe(5);
    expect(grid?.rows).toBe(4);
    expect(grid!.xRatio * image.width).toBeCloseTo(20 * scale, -1);
    expect(grid!.yRatio * image.height).toBeCloseTo(90 * scale, -1);
    expect(grid!.widthRatio * image.width).toBeCloseTo(380 * scale, -1);
    expect(grid!.columnGapRatio).toBeCloseTo(10 / 380, 2);
  });

  it("locates an inventory embedded in a larger emulator screenshot", () => {
    const image = inventory({ offsetX: 180, offsetY: 240 });
    const grid = detectScreenshotGrid(image)!;
    expect(grid.rows).toBe(4);
    expect(grid.xRatio * image.width).toBeCloseTo(180);
    expect(grid.yRatio * image.height).toBeCloseTo(240);
  });

  it("allows a partially filled last row", () => {
    expect(detectScreenshotGrid(inventory({ missing: [18, 19] }))?.rows).toBe(4);
    expect(detectScreenshotGrid(inventory({ rows: 2, missing: [6, 7, 8, 9] }))?.rows).toBe(2);
  });

  it("supports a single complete row", () => {
    expect(detectScreenshotGrid(inventory({ rows: 1 }))?.rows).toBe(1);
  });

  it("does not include a row clipped by the image edge", () => {
    const image = inventory();
    image.height = 90 + 3 * 78 + 30;
    expect(detectScreenshotGrid(image)?.rows).toBe(3);
  });

  it("falls back to manual controls for blank images or insufficient tiles", () => {
    const blank = inventory();
    blank.data.fill(0);
    expect(detectScreenshotGrid(blank)).toBeNull();
    expect(detectScreenshotGrid(inventory({ rows: 1, missing: [3, 4] }))).toBeNull();
  });
});
