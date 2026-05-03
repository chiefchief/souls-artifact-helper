import {
  artifactImageCollections,
  type ArtifactImage,
  type ArtifactImageCollection,
} from "../../data/artifactImageCollections";

export const rarityFilters = ["all", "mythic", "legendary"] as const;
export type RarityFilter = (typeof rarityFilters)[number];
export const ARTIFACT_QUANTITIES_STORAGE_KEY = "souls_artifact_quantities_v1";

export type GalleryArtifactItem = {
  key: string;
  imageUrl: string;
  name: string;
  quantity?: number;
  isOwned?: boolean;
};

export const extractedArtifactById = new Map(
  artifactImageCollections.flatMap((collection) =>
    collection.images.map((artifact) => [artifact.id, artifact] as const),
  ),
);

const LEGENDARY_NON_MYTHIC_MATERIAL_IDS = new Set([
  "legendary-17", // Adventurer's Chronicle
  "legendary-24", // Guide's Vambrace
  "legendary-20", // Crown of Fire
  "legendary-28", // Mace of Punishment
  "legendary-30", // Cursed Sword
  "legendary-23", // Gold Earrings
]);

export function canCraftArtifact(
  artifact: ArtifactImage,
  artifactQuantities: Record<string, number>,
) {
  if (!artifact.crafting) {
    return false;
  }

  return artifact.crafting.ingredients.every(
    (ingredient) =>
      (artifactQuantities[ingredient.artifactId] ?? 0) >= ingredient.quantity,
  );
}

export function sortCollectionsByQuantity(
  collections: ArtifactImageCollection[],
  artifactQuantities: Record<string, number>,
) {
  return collections.map((collection) => ({
    ...collection,
    images: [...collection.images].sort((first, second) => {
      const firstIsNonMaterial =
        collection.id === "legendary" &&
        LEGENDARY_NON_MYTHIC_MATERIAL_IDS.has(first.id);
      const secondIsNonMaterial =
        collection.id === "legendary" &&
        LEGENDARY_NON_MYTHIC_MATERIAL_IDS.has(second.id);

      if (firstIsNonMaterial && !secondIsNonMaterial) {
        return 1;
      }

      if (!firstIsNonMaterial && secondIsNonMaterial) {
        return -1;
      }

      const firstQuantity = artifactQuantities[first.id] ?? 0;
      const secondQuantity = artifactQuantities[second.id] ?? 0;

      if (firstQuantity > 0 && secondQuantity === 0) {
        return -1;
      }

      if (firstQuantity === 0 && secondQuantity > 0) {
        return 1;
      }

      return first.id.localeCompare(second.id);
    }),
  }));
}

export function buildObtainedGalleryItems(
  allArtifacts: ArtifactImage[],
  artifactQuantities: Record<string, number>,
) {
  return allArtifacts.flatMap((artifact) => {
    const quantity = artifactQuantities[artifact.id] ?? 0;
    if (quantity <= 0) {
      return [];
    }

    const shouldExpand = artifact.id.startsWith("mythic-");
    if (!shouldExpand) {
      return [
        {
          key: artifact.id,
          imageUrl: artifact.imageUrl,
          name: artifact.name,
          quantity,
        },
      ];
    }

    return Array.from({ length: quantity }, (_, index) => ({
      key: `${artifact.id}-${index + 1}`,
      imageUrl: artifact.imageUrl,
      name: artifact.name,
    }));
  });
}
