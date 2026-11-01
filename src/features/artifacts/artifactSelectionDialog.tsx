import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { ArtifactImage } from "../../data/artifactImageCollections";
import { detectArtifactRarityFromImage, type ArtifactRarity } from "./helpers/artifactRarity";
import type { CellPreview } from "./helpers/screenshotGrid";
import { recognizeArtifactQuantity, type DetectedArtifact } from "./screenshotCounter.v4";
import { getArtifactCandidates, type ArtifactCandidate } from "./helpers/recognizeArtifactFromGridCell";

export function ArtifactSelectionDialog({
  cell,
  detection,
  allArtifacts,
  onSelect,
  onClose,
}: {
  cell: CellPreview;
  detection?: DetectedArtifact;
  allArtifacts: ArtifactImage[];
  onSelect: (artifact: ArtifactImage, quantity: number) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<ArtifactRarity | "all">("all");
  const [suggestedRarity, setSuggestedRarity] = useState<ArtifactRarity | null>(null);
  const [selectedId, setSelectedId] = useState(detection?.artifactId ?? "");
  const [quantity, setQuantity] = useState(String(detection?.quantity ?? 1));
  const [isReadingQuantity, setIsReadingQuantity] = useState(false);
  const [quantityError, setQuantityError] = useState(false);
  const [predictions, setPredictions] = useState<ArtifactCandidate[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const filterTouched = useRef(false);
  const quantityTouched = useRef(false);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    searchRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getArtifactCandidates(cell)
      .then((candidates) => {
        if (!cancelled) setPredictions(candidates);
      })
      .catch(() => {
        /* Manual selection remains available if the model is unavailable. */
      });
    return () => {
      cancelled = true;
    };
  }, [cell]);

  useEffect(() => {
    let cancelled = false;
    void detectArtifactRarityFromImage(cell.imageUrl).then((suggestion) => {
      if (cancelled) return;
      setSuggestedRarity(suggestion);
      if (!filterTouched.current) setRarity(suggestion ?? "all");
    });
    return () => {
      cancelled = true;
    };
  }, [cell.imageUrl]);

  useEffect(() => {
    setIsReadingQuantity(false);
    if (!selectedId) return;
    if (selectedId === detection?.artifactId) {
      if (!quantityTouched.current) setQuantity(String(detection.quantity));
      return;
    }
    let cancelled = false;
    setIsReadingQuantity(true);
    setQuantityError(false);
    void recognizeArtifactQuantity(cell, selectedId)
      .then((value) => {
        if (!cancelled && !quantityTouched.current) setQuantity(String(value));
      })
      .catch(() => {
        if (!cancelled) setQuantityError(true);
      })
      .finally(() => {
        if (!cancelled) setIsReadingQuantity(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cell, selectedId, detection?.artifactId]);

  const selectedArtifact = allArtifacts.find((artifact) => artifact.id === selectedId);
  const confidences = new Map(predictions.map((prediction) => [prediction.artifactId, prediction.confidence]));
  const candidates = allArtifacts
    .filter(
      (artifact) =>
        (rarity === "all" || artifact.id.startsWith(`${rarity}-`)) &&
        artifact.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
    )
    .sort((a, b) => (confidences.get(b.id) ?? -1) - (confidences.get(a.id) ?? -1));
  const validQuantity = /^\d+$/.test(quantity) && Number.isSafeInteger(Number(quantity)) && Number(quantity) >= 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-3"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="artifact-picker-title"
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-souls-spirit/30 bg-souls-night text-souls-parchment shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onClose();
          }
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input, select"),
          );
          const first = controls[0],
            last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="shrink-0 space-y-3 border-b border-souls-spirit/20 p-3">
          <div className="flex items-start gap-3">
            <img src={cell.imageUrl} alt="Screenshot artifact to match" className="size-16 rounded object-contain" />
            <div className="min-w-0 flex-1">
              <h3 id="artifact-picker-title" className="font-bold text-souls-gold">
                Choose artifact
              </h3>
              <p className="mt-1 text-xs text-souls-panel">Select the artifact matching this screenshot.</p>
              <p className="mt-1 text-xs text-souls-panel">
                {suggestedRarity
                  ? `Background suggests ${suggestedRarity}. You can change the filter.`
                  : "Choose any rarity if the background is unclear."}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close artifact selection"
              onClick={onClose}
              className="grid size-9 shrink-0 place-items-center rounded hover:bg-souls-spirit/15"
            >
              <X className="size-5" />
            </button>
          </div>
          <input
            ref={searchRef}
            type="search"
            aria-label="Search artifacts"
            placeholder="Search artifacts…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-10 w-full rounded border border-souls-spirit/30 bg-souls-void px-3 text-sm focus:border-souls-gold focus:outline-none"
          />
          <div role="group" aria-label="Artifact rarity" className="grid grid-cols-3 gap-2">
            {(["primal", "mythic", "legendary"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={rarity === value}
                onClick={() => {
                  filterTouched.current = true;
                  setRarity((current) => (current === value ? "all" : value));
                }}
                className="min-h-10 rounded border border-souls-spirit/30 px-2 text-sm font-semibold capitalize transition hover:border-souls-gold aria-pressed:border-souls-gold aria-pressed:bg-souls-gold aria-pressed:text-souls-void"
              >
                {value}
              </button>
            ))}
          </div>
          <p className="text-xs text-souls-panel">
            {predictions.length > 0 && "Most likely first. "}
            {rarity === "all" ? "Showing all rarities." : "Tap the selected rarity again to show all."}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          {candidates.length ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {candidates.map((artifact) => (
                <button
                  key={artifact.id}
                  type="button"
                  aria-label={`Select ${artifact.name} (${artifact.id.split("-")[0]})`}
                  aria-pressed={selectedId === artifact.id}
                  onClick={() => setSelectedId(artifact.id)}
                  className="rounded border border-souls-spirit/25 p-1.5 text-center transition hover:border-souls-gold aria-pressed:border-souls-gold aria-pressed:bg-souls-gold/15 focus-visible:outline-2 focus-visible:outline-souls-gold"
                >
                  <img src={artifact.imageUrl} alt="" className="aspect-square w-full rounded object-contain" />
                  <span className="mt-1 block text-xs leading-4">{artifact.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-souls-panel">
              No artifacts found. Try another name or tap the selected rarity to show all.
            </p>
          )}
        </div>
        <div className="shrink-0 space-y-2 border-t border-souls-spirit/20 p-3">
          <p className="text-sm text-souls-gold">{selectedArtifact?.name ?? "Select an artifact above"}</p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              Qty
              <input
                aria-label="Artifact quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => {
                  quantityTouched.current = true;
                  setQuantity(event.target.value);
                }}
                className="min-h-10 w-20 rounded border border-souls-spirit/30 bg-souls-void px-2"
              />
            </label>
            <button
              type="button"
              disabled={!selectedArtifact || !validQuantity || isReadingQuantity}
              onClick={() => selectedArtifact && onSelect(selectedArtifact, Number(quantity))}
              className="ml-auto min-h-10 rounded bg-souls-gold px-4 py-2 text-sm font-semibold text-souls-void disabled:opacity-50"
            >
              {isReadingQuantity ? "Reading quantity…" : "Use artifact"}
            </button>
          </div>
          <p className="text-xs text-souls-panel">
            {quantityError
              ? "Could not read quantity. Please enter it manually."
              : "Qty includes upgrade diamonds for Legendary artifacts. Please verify it."}
          </p>
        </div>
      </section>
    </div>
  );
}
