import { X } from "lucide-react";
import { useMemo, useState } from "react";
import type { ArtifactImage } from "../../data/artifactImageCollections";
import { extractedArtifactById, type GalleryArtifactItem } from "./utils";

export function ArtifactGalleryModal({
  artifacts,
  title,
  onClose,
}: {
  artifacts: GalleryArtifactItem[];
  title: string;
  onClose: () => void;
}) {
  const [deprioritizeOwned, setDeprioritizeOwned] = useState(false);
  const mythicArtifacts = artifacts.filter((artifact) => artifact.key.startsWith("mythic-"));
  const legendaryArtifacts = artifacts.filter((artifact) => artifact.key.startsWith("legendary-"));
  const showSeparatedRarities =
    title === "Crafted artifacts" && mythicArtifacts.length > 0 && legendaryArtifacts.length > 0;
  const canDeprioritizeOwned = title === "Artifacts I can craft";
  const visibleArtifacts = useMemo(() => {
    if (!canDeprioritizeOwned || !deprioritizeOwned) {
      return artifacts;
    }

    return [...artifacts].sort((first, second) => {
      const firstOwned = Boolean(first.isOwned);
      const secondOwned = Boolean(second.isOwned);
      if (firstOwned === secondOwned) {
        return 0;
      }
      return firstOwned ? 1 : -1;
    });
  }, [artifacts, canDeprioritizeOwned, deprioritizeOwned]);

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
        <div className="overflow-y-auto p-4">
          {canDeprioritizeOwned ? (
            <div className="mb-3">
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
              <ArtifactGallerySection artifacts={mythicArtifacts} title="Mythic" />
              <ArtifactGallerySection artifacts={legendaryArtifacts} title="Legendary" />
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
          className="relative grid aspect-square place-items-center rounded border border-souls-spirit/18 bg-souls-void/55 p-2 transition"
          data-owned={artifact.isOwned ? "true" : "false"}
          data-owned-deprioritized={deprioritizeOwned ? "true" : "false"}
          key={artifact.key}
          style={deprioritizeOwned && artifact.isOwned ? { opacity: 0.28 } : undefined}
        >
          <img alt={artifact.name} className="h-full w-full object-contain" loading="lazy" src={artifact.imageUrl} />
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
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-souls-void/78 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="legendary-guide-title"
        aria-modal="true"
        className="w-full max-w-2xl overflow-hidden rounded border border-souls-spirit/30 bg-souls-night text-souls-parchment shadow-2xl"
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

        <div className="space-y-4 p-4 text-sm leading-6 text-souls-panel">
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

export function MythicCraftModal({ artifact, onClose }: { artifact: ArtifactImage; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-souls-void/78 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="craft-modal-title"
        className="w-full max-w-2xl overflow-hidden rounded border border-souls-spirit/30 bg-souls-night text-souls-parchment shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-souls-spirit/20 p-5">
          <div className="flex gap-4">
            <img alt={artifact.name} className="size-20 rounded object-contain" src={artifact.imageUrl} />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-souls-spirit">Mythic craft</p>
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

        <div className="p-5">
          {artifact.crafting ? (
            <div>
              <p className="text-sm text-souls-panel">Required Legendary artifacts:</p>
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
              No craft recipe is mapped for this Mythic artifact yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
