import { describe, expect, it } from "vitest";
import { confirmArtifactPrediction } from "./artifactPrediction";

describe("artifact scale confirmation", () => {
  const original = { index: 62, confidence: 0.2452 };

  it("accepts the original candidate when both scales independently confirm it", () => {
    expect(
      confirmArtifactPrediction(original, [
        { index: 62, confidence: 0.9412 },
        { index: 62, confidence: 0.9501 },
      ]),
    ).toEqual({ index: 62, confidence: (0.9412 + 0.9501) / 2 });
  });

  it.each(
    [
      [],
      [{ index: 62, confidence: 0.99 }],
      [
        { index: 62, confidence: 0.99 },
        { index: 62, confidence: 0.7 },
      ],
      [
        { index: 62, confidence: 0.99 },
        { index: 63, confidence: 0.99 },
      ],
      [
        { index: 63, confidence: 0.99 },
        { index: 63, confidence: 0.99 },
      ],
    ].map((retries) => ({ retries })),
  )("leaves ambiguous or conflicting retries below the acceptance threshold: %j", ({ retries }) => {
    expect(confirmArtifactPrediction(original, retries)).toBe(original);
  });

  it("keeps confident original predictions unchanged", () => {
    const confident = { index: 2, confidence: 0.99 };
    expect(confirmArtifactPrediction(confident, [{ index: 4, confidence: 1 }])).toBe(confident);
  });
});
