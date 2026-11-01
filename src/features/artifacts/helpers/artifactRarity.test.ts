import { describe, expect, it } from "vitest";
import { Jimp } from "jimp";
import { readFileSync } from "node:fs";
import { detectArtifactRarity } from "./artifactRarity";
import { detectScreenshotGrid } from "./detectScreenshotGrid";
import { getGridRowLayout } from "./screenshotGrid";

describe("artifact background rarity", () => {
  it.each([
    ["primal", "mace-of-judgment"],
    ["mythic", "eternal-bond"],
    ["legendary", "steel-beasts-bone"],
  ])("identifies the %s background in real catalog artwork", async (rarity, name) => {
    const image = await Jimp.read(`public/artifacts/${rarity}/${name}.png`);
    expect(detectArtifactRarity(image.bitmap)).toBe(rarity);
  });

  it("identifies the upgraded, equipped Guardian from the failing screenshot", async () => {
    const image = await Jimp.read("scripts/artifact/fixtures/guardian-of-the-sage-upgraded.png");
    expect(detectArtifactRarity(image.bitmap)).toBe("legendary");
  });

  it("does not confuse the gold border with the background in the stitched inventory", async () => {
    const image = await Jimp.read(readFileSync(new URL("./__fixtures__/stitched-inventory.png", import.meta.url)));
    const grid = detectScreenshotGrid(image.bitmap)!;
    let confident = 0;
    for (let row = 0; row < 10; row++) {
      const layout = getGridRowLayout(grid, row);
      const gap = grid.widthRatio * image.bitmap.width * (grid.columnGapRatio ?? 0);
      const width = (grid.widthRatio * image.bitmap.width - gap * 4) / 5;
      for (let col = 0; col < 5; col++) {
        const cell = image.clone().crop({
          x: Math.floor(grid.xRatio * image.bitmap.width + col * (width + gap)),
          y: Math.floor((grid.yRatio + layout.topRatio * grid.heightRatio) * image.bitmap.height),
          w: Math.floor(width),
          h: Math.floor(layout.heightRatio * grid.heightRatio * image.bitmap.height),
        });
        const rarity = detectArtifactRarity(cell.bitmap);
        if (rarity) {
          confident++;
          expect(rarity, `row ${row + 1}, col ${col + 1}`).toBe(row < 3 ? "mythic" : "legendary");
        }
      }
    }
    expect(confident).toBeGreaterThanOrEqual(40);
  });

  it("leaves blank or unsupported backgrounds unfiltered", () => {
    const image = new Jimp({ width: 64, height: 64, color: 0x555555ff });
    expect(detectArtifactRarity(image.bitmap)).toBeNull();
    image.scan((_x, _y, i) => {
      image.bitmap.data[i] = 150;
      image.bitmap.data[i + 1] = 30;
      image.bitmap.data[i + 2] = 200;
    });
    expect(detectArtifactRarity(image.bitmap)).toBeNull();
  });
});
