export const ARTIFACT_CONFIDENCE_THRESHOLD = 0.45;
export const ARTIFACT_RETRY_CROPS = [0.03, 0.06] as const;

export type ArtifactPrediction = { index: number; confidence: number };

// A different scale may help with text, diamonds and equipped badges covering
// the icon. Never use a single lucky retry or change the original candidate.
export function confirmArtifactPrediction(
  original: ArtifactPrediction,
  retries: ArtifactPrediction[],
): ArtifactPrediction {
  if (original.confidence >= ARTIFACT_CONFIDENCE_THRESHOLD) return original;
  if (
    retries.length !== ARTIFACT_RETRY_CROPS.length ||
    retries.some((prediction) => prediction.index !== original.index || prediction.confidence < 0.8)
  )
    return original;
  return {
    index: original.index,
    confidence: retries.reduce((sum, prediction) => sum + prediction.confidence, 0) / retries.length,
  };
}
