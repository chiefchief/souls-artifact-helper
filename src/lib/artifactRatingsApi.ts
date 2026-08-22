import type { ArtifactRatings } from "../data/artifactImageCollections";

export const artifactRatingsApiUrl = "https://souls-artifacts-api.souls-artifacts-helper.workers.dev";

type RatingsResponse = {
  ratings: Record<string, ArtifactRatings>;
};

async function getErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? `Request failed with status ${response.status}.`;
}

export async function fetchArtifactRatingOverrides(): Promise<Record<string, ArtifactRatings>> {
  const response = await fetch(`${artifactRatingsApiUrl}/ratings`);
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json() as RatingsResponse).ratings;
}

export async function saveArtifactRating({
  artifactId,
  rating,
  token,
}: {
  artifactId: string;
  rating: ArtifactRatings;
  token: string;
}): Promise<void> {
  const response = await fetch(`${artifactRatingsApiUrl}/ratings/${artifactId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rating),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}
