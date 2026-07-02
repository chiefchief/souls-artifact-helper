import { Link, createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { artifactImageCollections, type ArtifactImage } from "../data/artifactImageCollections";
import { ArtifactIconCollection } from "../features/artifacts/collection";
import { ArtifactGalleryModal, LegendaryCountGuideModal, MythicCraftModal } from "../features/artifacts/modals";
import { ScreenshotCounterPanel } from "../features/artifacts/screenshotCounterPanel";
import {
  ARTIFACT_QUANTITIES_STORAGE_KEY,
  buildObtainedGalleryItems,
  canCraftArtifact,
  rarityFilters,
  sortCollectionsByQuantity,
  type GalleryArtifactItem,
  type RarityFilter,
} from "../features/artifacts/utils";

export const Route = createFileRoute("/")({ component: Home });

type GalleryModalState = {
  title: string;
  artifacts: GalleryArtifactItem[];
};

function Home() {
  const appIconUrl = `${import.meta.env.BASE_URL}brand/favicon.png`;
  const [query, setQuery] = useState("");
  const [artifactQuantities, setArtifactQuantities] = useState<Record<string, number>>({});
  const [isQuantitiesHydrated, setIsQuantitiesHydrated] = useState(false);
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");
  const [selectedMythicArtifact, setSelectedMythicArtifact] = useState<ArtifactImage | null>(null);
  const [galleryModal, setGalleryModal] = useState<GalleryModalState | null>(null);
  const [isLegendaryGuideOpen, setIsLegendaryGuideOpen] = useState(false);
  const stickyControlsRef = useRef<HTMLDivElement | null>(null);
  const [isStickyStuck, setIsStickyStuck] = useState(false);
  const stickyStateRef = useRef(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const serialized = window.localStorage.getItem(ARTIFACT_QUANTITIES_STORAGE_KEY);
    if (!serialized) {
      setIsQuantitiesHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(serialized) as Record<string, unknown>;
      const normalized = Object.fromEntries(
        Object.entries(parsed)
          .map(([key, value]) => [key, Number(value)] as const)
          .filter(([, value]) => Number.isFinite(value) && value > 0),
      ) as Record<string, number>;
      setArtifactQuantities(normalized);
    } catch {
      // ignore malformed storage payload
    } finally {
      setIsQuantitiesHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!isQuantitiesHydrated) {
      return;
    }

    window.localStorage.setItem(ARTIFACT_QUANTITIES_STORAGE_KEY, JSON.stringify(artifactQuantities));
  }, [artifactQuantities, isQuantitiesHydrated]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let rafId = 0;
    function updateStickyState() {
      if (rafId !== 0) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        const top = stickyControlsRef.current?.getBoundingClientRect().top;
        const nextIsStuck = typeof top === "number" ? top <= 0 : false;
        if (stickyStateRef.current !== nextIsStuck) {
          stickyStateRef.current = nextIsStuck;
          setIsStickyStuck(nextIsStuck);
        }
        rafId = 0;
      });
    }

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", updateStickyState);

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", updateStickyState);
    };
  }, []);

  const allArtifacts = useMemo(() => artifactImageCollections.flatMap((collection) => collection.images), []);
  const mythicArtifacts = useMemo(
    () => artifactImageCollections.find((collection) => collection.id === "mythic")?.images ?? [],
    [],
  );

  const filteredCollections = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const collectionsByRarity =
      rarityFilter === "all"
        ? artifactImageCollections
        : artifactImageCollections.filter((collection) => collection.id === rarityFilter);

    return sortCollectionsByQuantity(
      collectionsByRarity
        .map((collection) => ({
          ...collection,
          images: collection.images.filter((artifact) => {
            const matchesQuery =
              normalizedQuery.length === 0 ||
              [artifact.id, artifact.name].join(" ").toLowerCase().includes(normalizedQuery);

            return matchesQuery;
          }),
        }))
        .filter((collection) => collection.images.length > 0),
      artifactQuantities,
    );
  }, [artifactQuantities, deferredQuery, rarityFilter]);

  const addArtifactQuantity = useCallback((artifactId: string, quantityToAdd: number) => {
    if (!Number.isFinite(quantityToAdd) || quantityToAdd <= 0) {
      return;
    }

    setArtifactQuantities((current) => ({
      ...current,
      [artifactId]: (current[artifactId] ?? 0) + Math.floor(quantityToAdd),
    }));
  }, []);

  const resetArtifactQuantity = useCallback((artifactId: string) => {
    setArtifactQuantities((current) => {
      const next = { ...current };
      delete next[artifactId];
      return next;
    });
  }, []);

  const resetAllArtifactQuantities = useCallback(() => {
    setArtifactQuantities({});
  }, []);

  const applyDetectedQuantities = useCallback((counts: Record<string, number>) => {
    setArtifactQuantities((current) => {
      const next = { ...current };
      for (const [artifactId, quantity] of Object.entries(counts)) {
        if (!Number.isFinite(quantity) || quantity <= 0) {
          continue;
        }
        next[artifactId] = (next[artifactId] ?? 0) + Math.floor(quantity);
      }
      return next;
    });
  }, []);

  const openObtainedModal = useCallback(() => {
    setGalleryModal({
      title: "Crafted artifacts",
      artifacts: buildObtainedGalleryItems(allArtifacts, artifactQuantities),
    });
  }, [allArtifacts, artifactQuantities]);

  const openCraftableModal = useCallback(() => {
    setGalleryModal({
      title: "Artifacts I can craft",
      artifacts: mythicArtifacts
        .filter((artifact) => canCraftArtifact(artifact, artifactQuantities))
        .map((artifact) => ({
          key: artifact.id,
          imageUrl: artifact.imageUrl,
          name: artifact.name,
          isOwned: (artifactQuantities[artifact.id] ?? 0) > 0,
        })),
    });
  }, [artifactQuantities, mythicArtifacts]);

  return (
    <main className="min-h-screen bg-souls-void text-souls-parchment">
      <section className="hero-shell min-h-screen py-4">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <nav className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded border border-souls-spirit/30 bg-souls-spirit/10">
                <img alt="Souls icon" className="size-6 object-contain" src={appIconUrl} />
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-souls-panel">
                Souls Artifacts
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                className="rounded border border-souls-gold bg-souls-gold px-3 py-1.5 text-sm font-medium text-souls-void"
                to="/"
              >
                Artifacts
              </Link>
              <Link
                className="rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                to="/soul-stone-calculator"
              >
                Soul Stone Calculator
              </Link>
              <Link
                className="rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                to="/heroes"
              >
                Heroes
              </Link>
              <Link
                className="rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                to="/support"
              >
                Support
              </Link>
            </div>
          </nav>

          <section className="artifact-preview p-4 md:p-5">
            <div className="flex flex-col gap-4 border-b border-souls-spirit/20 pb-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-souls-spirit">Inventory</p>
                <h1 className="mt-1 text-3xl font-black text-souls-parchment md:text-4xl">Crafted artifacts</h1>
              </div>

              <label className="flex min-h-10 w-full items-center gap-2 rounded border border-souls-spirit/25 bg-souls-void/55 px-3 lg:max-w-md">
                <Search className="size-4 text-souls-spirit" />
                <input
                  className="w-full bg-transparent text-sm text-souls-parchment outline-none placeholder:text-souls-panel/65"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search artifact name"
                  value={query}
                />
              </label>
            </div>

            <div
              className="sticky-controls sticky top-0 z-30 mt-3 flex flex-col gap-2 rounded border border-souls-spirit/25 bg-souls-night/85 p-2 backdrop-blur-md md:flex-row md:items-center md:justify-between"
              data-stuck={isStickyStuck}
              ref={stickyControlsRef}
            >
              <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap">
                {rarityFilters.map((filter) => (
                  <button
                    className="w-full rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium capitalize text-souls-panel transition data-[active=true]:border-souls-gold data-[active=true]:bg-souls-gold data-[active=true]:text-souls-void md:w-auto"
                    data-active={rarityFilter === filter}
                    key={filter}
                    onClick={() => setRarityFilter(filter)}
                    type="button"
                  >
                    {filter === "all" ? "All" : filter}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2 md:flex md:flex-wrap">
                <button
                  className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-leaf hover:bg-souls-leaf hover:text-souls-void md:w-auto"
                  onClick={openObtainedModal}
                  type="button"
                >
                  Show crafted artifacts
                </button>
                <button
                  className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void md:w-auto"
                  onClick={openCraftableModal}
                  type="button"
                >
                  Show artifacts I can craft
                </button>
                <button
                  className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded border border-souls-ember/30 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-ember hover:bg-souls-ember hover:text-souls-void md:w-auto"
                  onClick={resetAllArtifactQuantities}
                  type="button"
                >
                  Reset all
                </button>
              </div>
            </div>
            <p className="mt-2 text-base font-semibold text-souls-panel/95">
              Tip: values entered in <strong>+Qty</strong> are added to the current amount.
            </p>

            <ScreenshotCounterPanel onApplyCounts={applyDetectedQuantities} />

            <div className="mt-6 space-y-8">
              {filteredCollections.length > 0 ? (
                filteredCollections.map((collection) => (
                  <ArtifactIconCollection
                    artifactQuantities={artifactQuantities}
                    collection={collection}
                    key={collection.id}
                    onAddQuantity={addArtifactQuantity}
                    onOpenArtifact={collection.id === "mythic" ? setSelectedMythicArtifact : undefined}
                    onOpenLegendaryGuide={() => setIsLegendaryGuideOpen(true)}
                    onResetQuantity={resetArtifactQuantity}
                  />
                ))
              ) : (
                <div className="rounded border border-souls-spirit/18 bg-souls-night/70 p-5 text-sm text-souls-panel">
                  No artifacts match the current filters.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
      {selectedMythicArtifact && (
        <MythicCraftModal artifact={selectedMythicArtifact} onClose={() => setSelectedMythicArtifact(null)} />
      )}
      {galleryModal && (
        <ArtifactGalleryModal
          artifacts={galleryModal.artifacts}
          onClose={() => setGalleryModal(null)}
          title={galleryModal.title}
        />
      )}
      {isLegendaryGuideOpen && <LegendaryCountGuideModal onClose={() => setIsLegendaryGuideOpen(false)} />}
    </main>
  );
}
