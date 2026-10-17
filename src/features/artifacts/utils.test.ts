import { describe, expect, it } from "vitest";
import { artifactClassifierIds, artifactImageCollections } from "../../data/artifactImageCollections";
import { buildObtainedGalleryItems, canCraftArtifact, getCraftingResults } from "./utils";

const primalArtifacts = artifactImageCollections.find((collection) => collection.id === "primal")!.images;

// Primal recipes require both an owned Mythic and four Legendary copies.
describe("Primal crafting", () => {
  it.each([
    ["primal-01", "mythic-11", "legendary-22"],
    ["primal-02", "mythic-03", "legendary-12"],
  ])("checks both ingredients for %s without consuming inventory", (id, mythicId, legendaryId) => {
    const artifact = primalArtifacts.find((candidate) => candidate.id === id)!;
    expect(canCraftArtifact(artifact, { [mythicId]: 1, [legendaryId]: 4 })).toBe(true);
    expect(canCraftArtifact(artifact, { [legendaryId]: 8 })).toBe(false);
    expect(canCraftArtifact(artifact, { [mythicId]: 1, [legendaryId]: 3 })).toBe(false);
    expect(canCraftArtifact(artifact, { "mythic-02": 1, [legendaryId]: 4 })).toBe(false);
    const inventory = { [mythicId]: 1, [legendaryId]: 4 };
    canCraftArtifact(artifact, inventory);
    expect(inventory).toEqual({ [mythicId]: 1, [legendaryId]: 4 });
  });

  it("does not invent a recipe for World Tree Branch", () => {
    const branch = artifactImageCollections
      .flatMap((collection) => collection.images)
      .find((artifact) => artifact.name === "World Tree Branch")!;
    expect(branch.id).toBe("mythic-35");
    expect(canCraftArtifact(branch, { "legendary-29": 100 })).toBe(false);
  });

  it("preserves each owned Primal in the crafted gallery", () => {
    const items = buildObtainedGalleryItems(primalArtifacts, { "primal-01": 2, "primal-02": 1 });
    expect(items.map((item) => item.key)).toEqual(["primal-01-1", "primal-01-2", "primal-02-1"]);
  });
});

it("keeps the shipped screenshot classifier labels stable as the catalog grows", () => {
  expect(artifactClassifierIds).toHaveLength(67);
  expect(artifactClassifierIds[0]).toBe("mythic-01");
  expect(artifactClassifierIds[33]).toBe("mythic-34");
  expect(artifactClassifierIds[34]).toBe("legendary-01");
  expect(artifactClassifierIds[66]).toBe("legendary-33");
  const catalogIds = new Set(
    artifactImageCollections.flatMap((collection) => collection.images.map((artifact) => artifact.id)),
  );
  expect(artifactClassifierIds.every((id) => catalogIds.has(id))).toBe(true);
});

describe("crafting uses", () => {
  it("includes every direct Mythic and Primal recipe using Steel Beast's Bone", () => {
    expect(
      getCraftingResults("legendary-22")
        .map((artifact) => artifact.id)
        .sort(),
    ).toEqual(["mythic-11", "mythic-21", "primal-01"]);
  });

  it("distinguishes the Mythic and Primal Mace of Judgment", () => {
    expect(
      getCraftingResults("legendary-12")
        .map((artifact) => artifact.id)
        .sort(),
    ).toEqual(["mythic-03", "primal-02"]);
  });

  it("returns no results for a material with no known recipe", () => {
    expect(getCraftingResults("legendary-17")).toEqual([]);
  });
});
