import { describe, expect, it } from "vitest";
import { parseArtifactClassifierLabels } from "./recognizeArtifactFromGridCell";
import shippedLabels from "../../../../public/models/artifacts/artifact-classifier-labels.json";
import { artifactImageCollections } from "../../../data/artifactImageCollections";

describe("artifact classifier labels", () => {
  it("preserves explicit model order including new artifact classes", () => {
    const labels = ["primal-02", "mythic-35", "primal-01", "legendary-01"];
    expect(parseArtifactClassifierLabels(labels)).toEqual(labels);
  });

  it.each([[], ["missing-id"], ["primal-01", "primal-01"], [1], null, {}])("rejects invalid labels: %j", (labels) => {
    expect(parseArtifactClassifierLabels(labels)).toBeNull();
  });

  it("ships labels for every catalog artifact, including Primal", () => {
    const catalogIds = artifactImageCollections.flatMap((collection) =>
      collection.images.map((artifact) => artifact.id),
    );
    expect([...shippedLabels].sort()).toEqual([...catalogIds].sort());
    expect(parseArtifactClassifierLabels(shippedLabels)).toEqual(shippedLabels);
    expect(shippedLabels).toEqual(expect.arrayContaining(["mythic-35", "primal-01", "primal-02"]));
  });
});
