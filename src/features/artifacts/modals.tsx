import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { usePageScrollLock } from "../../lib/usePageScrollLock";
import type { ArtifactImage } from "../../data/artifactImageCollections";
import { extractedArtifactById, getCraftingResults, type GalleryArtifactItem } from "./utils";

export function ArtifactGalleryModal({
  artifacts,
  title,
  onClose,
}: {
  artifacts: GalleryArtifactItem[];
  title: string;
  onClose: () => void;
}) {
  usePageScrollLock();
  const [deprioritizeOwned, setDeprioritizeOwned] = useState(false);
  const [includePvpRating, setIncludePvpRating] = useState(true);
  const [includePveRating, setIncludePveRating] = useState(true);
  const raritySections = ["primal", "mythic", "legendary"]
    .map((rarity) => ({
      rarity,
      artifacts: artifacts.filter((artifact) => artifact.key.startsWith(`${rarity}-`)),
    }))
    .filter((section) => section.artifacts.length > 0);
  const showSeparatedRarities = title === "Crafted artifacts" && raritySections.length > 1;
  const canDeprioritizeOwned = title === "Artifacts I can craft";
  const visibleArtifacts = useMemo(() => {
    if (!canDeprioritizeOwned) {
      return artifacts;
    }

    return [...artifacts].sort((first, second) => {
      const firstOwned = Boolean(first.isOwned);
      const secondOwned = Boolean(second.isOwned);
      if (deprioritizeOwned && firstOwned !== secondOwned) {
        return firstOwned ? 1 : -1;
      }

      const firstRating =
        (includePvpRating ? (first.ratings?.pvp ?? 0) : 0) + (includePveRating ? (first.ratings?.pve ?? 0) : 0);
      const secondRating =
        (includePvpRating ? (second.ratings?.pvp ?? 0) : 0) + (includePveRating ? (second.ratings?.pve ?? 0) : 0);

      if (firstRating !== secondRating) {
        return secondRating - firstRating;
      }

      return first.name.localeCompare(second.name);
    });
  }, [artifacts, canDeprioritizeOwned, deprioritizeOwned, includePveRating, includePvpRating]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-souls-void/78 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-modal="true"
        aria-labelledby="artifact-gallery-modal-title"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded border border-souls-spirit/30 bg-souls-night text-souls-parchment shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-souls-spirit/20 bg-souls-night p-4">
          <h2 className="text-xl font-black" id="artifact-gallery-modal-title">
            {title}
          </h2>
          <button
            aria-label="Close artifact gallery modal"
            className="grid size-9 place-items-center rounded border border-souls-spirit/20 text-souls-panel transition hover:border-souls-gold hover:text-souls-gold"
            onClick={onClose}
            type="button"
          >
            <X className="size-4.5" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-4">
          {canDeprioritizeOwned ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                aria-pressed={includePvpRating}
                className={`rounded border px-3 py-1.5 text-sm font-medium transition ${
                  includePvpRating
                    ? "border-souls-gold bg-souls-gold text-souls-void"
                    : "border-souls-spirit/20 text-souls-panel hover:border-souls-gold hover:text-souls-gold"
                }`}
                onClick={() => setIncludePvpRating((current) => !current)}
                type="button"
              >
                PVP
              </button>
              <button
                aria-pressed={includePveRating}
                className={`rounded border px-3 py-1.5 text-sm font-medium transition ${
                  includePveRating
                    ? "border-souls-gold bg-souls-gold text-souls-void"
                    : "border-souls-spirit/20 text-souls-panel hover:border-souls-gold hover:text-souls-gold"
                }`}
                onClick={() => setIncludePveRating((current) => !current)}
                type="button"
              >
                PVE
              </button>
              <button
                className="rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                onClick={() => setDeprioritizeOwned((current) => !current)}
                type="button"
              >
                {deprioritizeOwned ? "Show all equally" : "Dim crafted artifacts"}
              </button>
            </div>
          ) : null}
          {showSeparatedRarities ? (
            <div className="space-y-5">
              {raritySections.map((section) => (
                <ArtifactGallerySection
                  artifacts={section.artifacts}
                  key={section.rarity}
                  title={section.rarity[0].toUpperCase() + section.rarity.slice(1)}
                />
              ))}
            </div>
          ) : visibleArtifacts.length > 0 ? (
            <ArtifactGalleryGrid artifacts={visibleArtifacts} deprioritizeOwned={deprioritizeOwned} />
          ) : (
            <div className="rounded border border-souls-spirit/18 bg-souls-void/55 p-4 text-sm text-souls-panel">
              No artifacts to display.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ArtifactGallerySection({ artifacts, title }: { artifacts: GalleryArtifactItem[]; title: string }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-souls-spirit">{title}</h3>
      <ArtifactGalleryGrid artifacts={artifacts} />
    </section>
  );
}

function ArtifactGalleryGrid({
  artifacts,
  deprioritizeOwned = false,
}: {
  artifacts: GalleryArtifactItem[];
  deprioritizeOwned?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      {artifacts.map((artifact) => (
        <div
          className="relative flex flex-col items-center rounded border border-souls-spirit/18 bg-souls-void/55 p-2 transition"
          data-owned={artifact.isOwned ? "true" : "false"}
          data-owned-deprioritized={deprioritizeOwned ? "true" : "false"}
          key={artifact.key}
          style={deprioritizeOwned && artifact.isOwned ? { opacity: 0.28 } : undefined}
          title={`${artifact.name} (${artifact.key.split("-")[0]})`}
        >
          <img
            alt={artifact.name}
            className="aspect-square w-full object-contain"
            loading="lazy"
            src={artifact.imageUrl}
          />
          <p className="mt-1 text-center text-[10px] leading-tight">{artifact.name}</p>
          <p className="mt-1 text-[10px] capitalize text-souls-panel">{artifact.key.split("-")[0]}</p>
          {artifact.quantity && artifact.quantity > 1 ? (
            <span className="absolute bottom-1 right-1 rounded bg-souls-gold px-1.5 py-0.5 text-[11px] font-bold text-souls-void">
              x{artifact.quantity}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function LegendaryCountGuideModal({ onClose }: { onClose: () => void }) {
  usePageScrollLock();
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-souls-void/78 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="legendary-guide-title"
        aria-modal="true"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded border border-souls-spirit/30 bg-souls-night text-souls-parchment shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4 border-b border-souls-spirit/20 p-4">
          <h2 className="text-xl font-black" id="legendary-guide-title">
            How to count Legendary artifacts
          </h2>
          <button
            aria-label="Close legendary guide"
            className="grid size-9 place-items-center rounded border border-souls-spirit/20 text-souls-panel transition hover:border-souls-gold hover:text-souls-gold"
            onClick={onClose}
            type="button"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-4 text-sm leading-6 text-souls-panel">
          <p>Enter value by diamond level so the planner can correctly estimate what Mythic artifacts you can craft:</p>
          <ul className="space-y-2">
            <li>
              <strong>0 diamonds:</strong> enter <strong>1</strong>
            </li>
            <li>
              <strong>1 or 2 diamonds:</strong> enter <strong>2</strong>
            </li>
            <li>
              <strong>3 diamonds:</strong> enter <strong>4</strong>
            </li>
          </ul>
          <p>
            Why this mapping: 1-diamond and 2-diamond upgrades already consume duplicate base Legendary artifacts, and
            3-diamond corresponds to a full 4-copy value in this planner.
          </p>
          <p>
            Input values are <strong>added</strong>, not replaced. Example: you enter <strong>2</strong>, later enter{" "}
            <strong>2</strong> again for the same artifact, final total becomes <strong>4</strong>.
          </p>
          <p>
            You can use <strong>Reset</strong> on a card to clear one artifact, or <strong>Reset all</strong> to clear
            everything.
          </p>
        </div>
      </section>
    </div>
  );
}

export function ArtifactCraftModal({
  artifact,
  onClose,
  onSelectArtifact,
}: {
  artifact: ArtifactImage;
  onClose: () => void;
  onSelectArtifact: (artifact: ArtifactImage) => void;
}) {
  usePageScrollLock();
  const isLegendary = artifact.id.startsWith("legendary-");
  const craftingResults = isLegendary ? getCraftingResults(artifact.id) : [];

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-souls-void/78 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="craft-modal-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded border border-souls-spirit/30 bg-souls-night text-souls-parchment shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-souls-spirit/20 p-5">
          <div className="flex gap-4">
            <img alt={artifact.name} className="size-20 rounded object-contain" src={artifact.imageUrl} />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-souls-spirit">
                {isLegendary ? "Crafting uses" : artifact.id.startsWith("primal-") ? "Primal craft" : "Mythic craft"}
              </p>
              <h2 className="mt-2 text-2xl font-black" id="craft-modal-title">
                {artifact.name}
              </h2>
            </div>
          </div>

          <button
            aria-label="Close craft modal"
            className="grid size-10 place-items-center rounded border border-souls-spirit/20 text-souls-panel transition hover:border-souls-gold hover:text-souls-gold"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain p-5">
          {isLegendary ? (
            <div>
              <p className="text-sm text-souls-panel">Artifacts that use {artifact.name} in their recipe:</p>
              {craftingResults.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {craftingResults.map((result) => (
                    <button
                      className="grid w-full grid-cols-[64px_minmax(0,1fr)] items-center gap-4 rounded border border-souls-spirit/18 bg-souls-void/55 p-3 text-left transition hover:border-souls-gold"
                      key={result.id}
                      onClick={() => onSelectArtifact(result)}
                      type="button"
                    >
                      <img alt={result.name} className="size-16 rounded object-contain" src={result.imageUrl} />
                      <div>
                        <p className="text-xs font-semibold capitalize text-souls-spirit">{result.id.split("-")[0]}</p>
                        <p className="mt-1 font-bold text-souls-gold">{result.name}</p>
                        <p className="mt-2 text-xs leading-5 text-souls-panel">
                          Required:{" "}
                          {result
                            .crafting!.ingredients.map(
                              (ingredient) =>
                                `${ingredient.quantity} × ${extractedArtifactById.get(ingredient.artifactId)?.name ?? ingredient.artifactId}`,
                            )
                            .join(" + ")}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded border border-souls-spirit/18 bg-souls-void/55 p-4 text-sm text-souls-panel">
                  No known crafting recipes use this artifact yet.
                </p>
              )}
            </div>
          ) : artifact.crafting ? (
            <div>
              <p className="text-sm text-souls-panel">Required artifacts:</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {artifact.crafting.ingredients.map((ingredient) => {
                  const ingredientArtifact = extractedArtifactById.get(ingredient.artifactId);

                  return (
                    <div
                      className="grid grid-cols-[64px_1fr] items-center gap-4 rounded border border-souls-spirit/18 bg-souls-void/55 p-3"
                      key={ingredient.artifactId}
                    >
                      {ingredientArtifact ? (
                        <img
                          alt={ingredientArtifact.name}
                          className="size-16 rounded object-contain"
                          src={ingredientArtifact.imageUrl}
                        />
                      ) : (
                        <span className="grid size-16 place-items-center rounded bg-souls-dusk">?</span>
                      )}
                      <div>
                        <p className="text-lg font-bold text-souls-gold">{ingredient.quantity}x</p>
                        <p className="mt-1 text-sm text-souls-panel">
                          {ingredientArtifact?.name ?? ingredient.artifactId}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-souls-panel">Source: {artifact.crafting.source}</p>
            </div>
          ) : (
            <div className="rounded border border-souls-spirit/18 bg-souls-void/55 p-4 text-sm leading-6 text-souls-panel">
              No craft recipe is mapped for this artifact yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
