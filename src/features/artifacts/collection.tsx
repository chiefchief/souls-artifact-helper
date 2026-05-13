import { Info, RotateCcw } from "lucide-react";
import { memo, useState } from "react";
import type {
  ArtifactImage,
  ArtifactImageCollection,
} from "../../data/artifactImageCollections";

export const ArtifactIconCollection = memo(function ArtifactIconCollection({
  collection,
  artifactQuantities,
  onOpenLegendaryGuide,
  onAddQuantity,
  onResetQuantity,
  onOpenArtifact,
}: {
  collection: ArtifactImageCollection;
  artifactQuantities: Record<string, number>;
  onOpenLegendaryGuide: () => void;
  onAddQuantity: (artifactId: string, quantityToAdd: number) => void;
  onResetQuantity: (artifactId: string) => void;
  onOpenArtifact?: (artifact: ArtifactImage) => void;
}) {
  const obtainedCount = collection.images.filter(
    (artifact) => (artifactQuantities[artifact.id] ?? 0) > 0,
  ).length;
  const totalCount = collection.images.reduce(
    (total, artifact) => total + (artifactQuantities[artifact.id] ?? 0),
    0,
  );

  return (
    <div className="artifact-collection">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black">{collection.title}</h2>
            {collection.id === "legendary" && (
              <button
                aria-label="Open legendary counting guide"
                className="grid size-7 place-items-center rounded border border-souls-spirit/25 text-souls-spirit transition hover:border-souls-gold hover:text-souls-gold"
                onClick={onOpenLegendaryGuide}
                type="button"
              >
                <Info className="size-4" />
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-souls-panel">
            {obtainedCount}/{collection.images.length} crafted · {totalCount}{" "}
            total
          </p>
        </div>
        <p className="max-w-2xl text-xs leading-5 text-souls-panel sm:text-sm sm:leading-6">
          {collection.description}
        </p>
      </div>

      {collection.images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
          {collection.images.map((artifact) => (
            <ArtifactInventoryCard
              artifact={artifact}
              key={artifact.id}
              onAddQuantity={onAddQuantity}
              onOpenArtifact={onOpenArtifact}
              onResetQuantity={onResetQuantity}
              quantity={artifactQuantities[artifact.id] ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="rounded border border-souls-spirit/18 bg-souls-night/70 p-5 text-sm text-souls-panel">
          No artifacts match the current search.
        </div>
      )}
    </div>
  );
});

const ArtifactInventoryCard = memo(function ArtifactInventoryCard({
  artifact,
  quantity,
  onAddQuantity,
  onResetQuantity,
  onOpenArtifact,
}: {
  artifact: ArtifactImage;
  quantity: number;
  onAddQuantity: (artifactId: string, quantityToAdd: number) => void;
  onResetQuantity: (artifactId: string) => void;
  onOpenArtifact?: (artifact: ArtifactImage) => void;
}) {
  const [quantityInput, setQuantityInput] = useState("");
  const isObtained = quantity > 0;

  function submitQuantity() {
    const parsedQuantity = Number(quantityInput);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }

    onAddQuantity(artifact.id, parsedQuantity);
    setQuantityInput("");
  }

  return (
    <article
      className="obtained-card flex flex-col"
      data-clickable={Boolean(onOpenArtifact)}
      data-obtained={isObtained}
      onClick={() => onOpenArtifact?.(artifact)}
    >
      <div className="relative">
        <img
          alt={artifact.name}
          className="mx-auto aspect-square w-full max-w-[56px] object-contain sm:max-w-[64px]"
          loading="lazy"
          src={artifact.imageUrl}
        />
        {isObtained && (
          <span className="absolute bottom-0 right-1 rounded bg-souls-leaf px-1.5 py-0.5 text-[11px] font-bold text-souls-void">
            x{quantity}
          </span>
        )}
      </div>

      <h3 className="mt-1 text-center text-[10px] font-semibold leading-tight text-souls-parchment sm:text-[11px] [text-wrap:balance]">
        {artifact.name}
      </h3>

      <div className="mt-auto grid grid-cols-[minmax(0,1fr)_1.8rem] gap-1 sm:grid-cols-[minmax(0,1fr)_2rem] sm:gap-1.5">
        <input
          className="min-h-7 min-w-0 rounded border border-souls-spirit/20 bg-souls-void/65 px-1.5 text-[10px] text-souls-parchment outline-none placeholder:text-souls-panel/55 focus:border-souls-spirit sm:min-h-8 sm:px-2 sm:text-[11px]"
          inputMode="numeric"
          min="1"
          onBlur={submitQuantity}
          onChange={(event) => setQuantityInput(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Enter") {
              submitQuantity();
            }
          }}
          placeholder="+Qty"
          type="number"
          value={quantityInput}
        />
        <button
          aria-label={`Reset ${artifact.name}`}
          className="grid size-7 shrink-0 place-items-center rounded border border-souls-spirit/20 bg-souls-void/65 text-souls-panel transition hover:border-souls-gold hover:text-souls-gold disabled:cursor-not-allowed disabled:opacity-35 sm:size-8"
          disabled={!isObtained}
          onClick={(event) => {
            event.stopPropagation();
            onResetQuantity(artifact.id);
          }}
          type="button"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </article>
  );
});
