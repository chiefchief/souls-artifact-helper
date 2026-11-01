export type ArtifactRarity = "primal" | "mythic" | "legendary";

// Sample the inner side bands rather than the frame, central artwork, level,
// class badge, diamonds or equipped/quantity labels. Ambiguous colours stay unfiltered.
export function detectArtifactRarity({
  width,
  height,
  data,
}: {
  width: number;
  height: number;
  data: ArrayLike<number>;
}): ArtifactRarity | null {
  const votes: Record<ArtifactRarity, number> = { primal: 0, mythic: 0, legendary: 0 };
  let samples = 0;
  for (let y = Math.floor(height * 0.25); y < height * 0.72; y++) {
    for (let x = Math.floor(width * 0.06); x < width * 0.94; x++) {
      if (x > width * 0.14 && x < width * 0.86) continue;
      const i = (y * width + x) * 4;
      if (data[i + 3] < 200) continue;
      samples++;
      const r = data[i] / 255,
        g = data[i + 1] / 255,
        b = data[i + 2] / 255;
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        delta = max - min;
      if (max < 0.2 || delta / max < 0.3) continue;
      const hue =
        ((max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4) * 60 + 360) % 360;
      if (hue < 22 || hue > 345) votes.legendary++;
      else if (hue >= 25 && hue <= 65) votes.mythic++;
      else if (hue >= 160 && hue <= 205) votes.primal++;
    }
  }
  const ranked = (Object.entries(votes) as [ArtifactRarity, number][]).sort((a, b) => b[1] - a[1]);
  const [rarity, count] = ranked[0];
  // Gold also appears on frames and upgrades, so require more coverage for Mythic.
  return samples >= 12 &&
    count / samples >= (rarity === "mythic" ? 0.6 : 0.3) &&
    (count - ranked[1][1]) / samples >= 0.08 &&
    count >= ranked[1][1] * 1.25
    ? rarity
    : null;
}

export async function detectArtifactRarityFromImage(imageUrl: string): Promise<ArtifactRarity | null> {
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imageUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(image, 0, 0, 64, 64);
    return detectArtifactRarity(context.getImageData(0, 0, 64, 64));
  } catch {
    return null;
  }
}
