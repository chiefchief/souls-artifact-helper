import { Link, createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  artifactImageCollections,
  type ArtifactImage,
  type ArtifactRating,
  type ArtifactRatings,
} from "../data/artifactImageCollections";
import { fetchArtifactRatingOverrides, saveArtifactRating } from "../lib/artifactRatingsApi";

export const Route = createFileRoute("/admin")({ component: AdminPage });

const tierRatings: ArtifactRating[] = [5, 4, 3, 2, 1];
const tierNames: Record<ArtifactRating, string> = { 1: "Weak", 2: "Situational", 3: "Good", 4: "Strong", 5: "Best" };
type RatingMode = keyof ArtifactRatings;
type Notification = { message: string; tone: "error" | "success" };

function AdminPage() {
  const collections = useMemo(
    () =>
      artifactImageCollections
        .filter((collection) => collection.id === "mythic")
        .map((collection) => ({ ...collection, images: [...collection.images].reverse() })),
    [],
  );
  const artifacts = useMemo(() => collections.flatMap((collection) => collection.images), [collections]);
  const [mode, setMode] = useState<RatingMode>("pvp");
  const [token, setToken] = useState("");
  const [remoteOverrides, setRemoteOverrides] = useState<Record<string, ArtifactRatings>>({});
  const [edits, setEdits] = useState<Record<string, ArtifactRatings>>({});
  const [draggedArtifactId, setDraggedArtifactId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isNotificationLeaving, setIsNotificationLeaving] = useState(false);

  useEffect(() => {
    void fetchArtifactRatingOverrides()
      .then(setRemoteOverrides)
      .catch(() =>
        setNotification({
          message: "Could not load remote ratings. The site is using its built-in ratings.",
          tone: "error",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!notification) return;

    setIsNotificationLeaving(false);
    const leaveTimeoutId = window.setTimeout(() => setIsNotificationLeaving(true), 3700);
    const removeTimeoutId = window.setTimeout(() => setNotification(null), 4000);
    return () => {
      window.clearTimeout(leaveTimeoutId);
      window.clearTimeout(removeTimeoutId);
    };
  }, [notification]);

  function dismissNotification() {
    setIsNotificationLeaving(true);
    window.setTimeout(() => setNotification(null), 300);
  }

  useEffect(() => {
    if (draggedArtifactId === null) {
      setDropTargetId(null);
    }
  }, [draggedArtifactId]);

  function getRating(artifact: ArtifactImage): ArtifactRatings {
    return edits[artifact.id] ?? remoteOverrides[artifact.id] ?? artifact.ratings;
  }

  function moveArtifact(artifactId: string, rating: ArtifactRating) {
    const artifact = artifacts.find((candidate) => candidate.id === artifactId);
    if (!artifact) return;
    setEdits((current) => {
      const savedRating = remoteOverrides[artifactId] ?? artifact.ratings;
      const nextRating = { ...(current[artifactId] ?? savedRating), [mode]: rating };

      if (nextRating.pvp === savedRating.pvp && nextRating.pve === savedRating.pve) {
        const { [artifactId]: _removed, ...remainingEdits } = current;
        return remainingEdits;
      }

      return { ...current, [artifactId]: nextRating };
    });
  }

  async function saveAll() {
    const updates = Object.entries(edits);
    if (!updates.length) return;
    if (!token.trim()) {
      setNotification({ message: "Paste ADMIN_TOKEN before saving ratings.", tone: "error" });
      return;
    }

    setIsSaving(true);
    setNotification(null);
    try {
      await Promise.all(
        updates.map(([artifactId, rating]) => saveArtifactRating({ artifactId, rating, token: token.trim() })),
      );
      setRemoteOverrides((current) => ({ ...current, ...edits }));
      setEdits({});
      setNotification({ message: `${updates.length} rating changes saved.`, tone: "success" });
    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : "Could not save ratings.", tone: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-souls-void px-5 py-8 text-souls-parchment md:px-8">
      <section className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-souls-gold">Private editor</p>
            <h1 className="mt-1 text-3xl font-black">Artifact tiers</h1>
          </div>
          <Link
            className="rounded border border-souls-spirit/30 px-3 py-2 text-sm text-souls-panel hover:border-souls-gold hover:text-souls-gold"
            to="/"
          >
            Back to site
          </Link>
        </div>

        <label className="mb-5 block rounded border border-souls-spirit/25 bg-souls-night p-4">
          <span className="block text-sm font-medium">ADMIN_TOKEN</span>
          <span className="mt-1 block text-sm text-souls-panel">
            Used only for this save request and never stored by the site.
          </span>
          <input
            autoComplete="off"
            className="mt-3 w-full rounded border border-souls-spirit/30 bg-souls-void px-3 py-2 text-souls-parchment outline-none focus:border-souls-gold"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste your secret token"
            type="password"
            value={token}
          />
        </label>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded border border-souls-spirit/25 bg-souls-night p-3">
          <div className="flex rounded border border-souls-spirit/30 p-1">
            <TierTab active={mode === "pvp"} label="PVP" onClick={() => setMode("pvp")} />
            <TierTab active={mode === "pve"} label="PVE" onClick={() => setMode("pve")} />
          </div>
          <button
            className="rounded border border-souls-gold bg-souls-gold px-4 py-2 text-sm font-bold text-souls-void disabled:cursor-not-allowed disabled:opacity-45"
            disabled={Object.keys(edits).length === 0 || isSaving}
            onClick={() => void saveAll()}
            type="button"
          >
            {isSaving ? "Saving…" : `Save all${Object.keys(edits).length ? ` (${Object.keys(edits).length})` : ""}`}
          </button>
        </div>

        {loading ? <p className="mb-4 text-souls-panel">Loading remote ratings…</p> : null}
        <p className="mb-3 text-sm text-souls-panel">
          Drag an artifact card into a tier. Changes remain local until you press Save all.
        </p>

        <div className="space-y-8">
          {collections.map((collection) => (
            <section key={collection.id}>
              <div className="mb-3 flex items-center gap-3">
                <h2
                  className={`text-xl font-black ${collection.id === "mythic" ? "text-souls-gold" : "text-souls-spirit"}`}
                >
                  {collection.title}
                </h2>
                <span className="text-sm text-souls-panel">{collection.images.length} artifacts</span>
              </div>
              <div className="space-y-3">
                {tierRatings.map((rating) => {
                  const targetId = `${collection.id}-${rating}`;
                  const tierArtifacts = collection.images.filter((artifact) => getRating(artifact)[mode] === rating);
                  return (
                    <section
                      className="tier-drop-zone grid grid-cols-[5.5rem_minmax(0,1fr)] overflow-hidden rounded border border-souls-spirit/25 bg-souls-night"
                      data-drop-target={dropTargetId === targetId}
                      key={rating}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDropTargetId(targetId);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const artifactId = event.dataTransfer.getData("text/artifact-id") || draggedArtifactId;
                        if (artifactId) moveArtifact(artifactId, rating);
                        setDraggedArtifactId(null);
                        setDropTargetId(null);
                      }}
                    >
                      <div className="grid place-items-center border-r border-souls-spirit/25 bg-souls-gold/10 p-2 text-center">
                        <strong className="text-2xl text-souls-gold">{rating}</strong>
                        <span className="text-[10px] uppercase tracking-wide text-souls-panel">
                          {tierNames[rating]}
                        </span>
                      </div>
                      <div className="min-h-28 p-3">
                        <TierArtifactGroup
                          artifacts={tierArtifacts}
                          onSelect={setSelectedArtifact}
                          rarity={collection.id === "mythic" ? "Mythic" : "Legendary"}
                          onDragStateChange={setDraggedArtifactId}
                        />
                        {tierArtifacts.length === 0 ? (
                          <p className="grid min-h-20 place-items-center text-sm text-souls-panel">
                            Drop artifacts here
                          </p>
                        ) : null}
                      </div>
                    </section>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>

      {notification ? (
        <NotificationToast
          isLeaving={isNotificationLeaving}
          notification={notification}
          onDismiss={dismissNotification}
        />
      ) : null}
      {selectedArtifact ? (
        <ArtifactDetailsModal
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
          rating={getRating(selectedArtifact)}
        />
      ) : null}
    </main>
  );
}

function TierTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      aria-pressed={active}
      className={`rounded px-4 py-1.5 text-sm font-bold transition ${active ? "bg-souls-gold text-souls-void" : "text-souls-panel hover:text-souls-gold"}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function TierArtifactGroup({
  artifacts,
  onSelect,
  rarity,
  onDragStateChange,
}: {
  artifacts: ArtifactImage[];
  onSelect: (artifact: ArtifactImage) => void;
  rarity: "Legendary" | "Mythic";
  onDragStateChange: (artifactId: string | null) => void;
}) {
  if (!artifacts.length) return null;
  return (
    <div className="mb-2 last:mb-0">
      <p
        className={`mb-1 text-[10px] font-bold uppercase tracking-[0.16em] ${rarity === "Mythic" ? "text-souls-gold" : "text-souls-spirit"}`}
      >
        {rarity}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {artifacts.map((artifact) => (
          <button
            className="tier-artifact-card grid size-16 place-items-center rounded border border-souls-spirit/20 bg-souls-void/60 p-1.5"
            draggable
            key={artifact.id}
            onClick={() => onSelect(artifact)}
            onDragEnd={() => onDragStateChange(null)}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/artifact-id", artifact.id);
              onDragStateChange(artifact.id);
            }}
            title={artifact.name}
            type="button"
          >
            <img alt={artifact.name} className="size-full object-contain" src={artifact.imageUrl} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ArtifactDetailsModal({
  artifact,
  onClose,
  rating,
}: {
  artifact: ArtifactImage;
  onClose: () => void;
  rating: ArtifactRatings;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-souls-void/78 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="artifact-details-title"
        aria-modal="true"
        className="relative w-full max-w-md rounded border border-souls-spirit/30 bg-souls-night p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="Close artifact details"
          className="absolute right-3 top-3 grid size-9 place-items-center rounded border border-souls-spirit/20 text-souls-panel hover:border-souls-gold hover:text-souls-gold"
          onClick={onClose}
          type="button"
        >
          <X className="size-4" />
        </button>
        <img alt="" className="mx-auto size-40 object-contain" src={artifact.imageUrl} />
        <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-souls-spirit">
          {artifact.id}
        </p>
        <h2 className="mt-1 text-center text-2xl font-black" id="artifact-details-title">
          {artifact.name}
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <RatingDetail label="PVP" value={rating.pvp} />
          <RatingDetail label="PVE" value={rating.pve} />
        </div>
        <div className="mt-5 rounded border border-dashed border-souls-spirit/30 bg-souls-void/45 p-3 text-center text-sm text-souls-panel">
          Description will be added here.
        </div>
      </section>
    </div>
  );
}

function RatingDetail({ label, value }: { label: string; value: ArtifactRating }) {
  return (
    <div className="rounded border border-souls-gold/35 bg-souls-gold/10 p-3 text-center">
      <p className="text-xs font-bold text-souls-panel">{label}</p>
      <p className="mt-1 text-2xl font-black text-souls-gold">{value}</p>
    </div>
  );
}

function NotificationToast({
  isLeaving,
  notification,
  onDismiss,
}: {
  isLeaving: boolean;
  notification: Notification;
  onDismiss: () => void;
}) {
  return (
    <aside
      aria-live="polite"
      className={`admin-toast fixed right-4 top-24 z-60 flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded border p-4 text-sm shadow-2xl ${notification.tone === "success" ? "border-souls-leaf bg-souls-leaf/80 text-souls-parchment" : "border-red-500 bg-red-950/60 text-red-50"}`}
      data-leaving={isLeaving}
      role="status"
    >
      <p className="flex-1">{notification.message}</p>
      <button
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 grid size-7 shrink-0 place-items-center rounded text-souls-panel hover:bg-souls-void/50 hover:text-souls-parchment"
        onClick={onDismiss}
        type="button"
      >
        <X className="size-4" />
      </button>
    </aside>
  );
}
