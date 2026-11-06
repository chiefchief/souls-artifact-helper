import { canEquipArtifact } from "../../data/artifactEquipment";
import type { HeroRole } from "../../heroes/types";
import { useState } from "react";
import { X } from "lucide-react";
import { artifactImageCollections } from "../../data/artifactImageCollections";

export const formationArtifacts = artifactImageCollections.flatMap((collection) => collection.images);
export const formationArtifactById = new Map(formationArtifacts.map((item) => [item.id, item]));

export function ArtifactPicker({
  heroName,
  heroRole,
  selectedId,
  onSelect,
  onClose,
}: {
  heroName: string;
  heroRole: HeroRole;
  selectedId?: string;
  onSelect: (id: string | null) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState("all");
  const options = formationArtifacts.filter(
    (item) =>
      canEquipArtifact(heroRole, item.id) &&
      (rarity === "all" || item.id.startsWith(`${rarity}-`)) &&
      item.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <aside className="formation-picker artifact-preview p-4" aria-label="Artifact selection">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="formation-picker-title" className="text-xl font-bold">
            Choose artifact
          </h2>
          <p className="mt-1 text-sm text-souls-panel">{heroName}</p>
        </div>
        <button className="formation-action" aria-label="Close artifact selection" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <p className="mt-2 text-xs text-souls-panel/70">
        Showing artifacts for this hero’s class and universal artifacts.
      </p>
      <input
        className="mt-4 w-full rounded border border-souls-spirit/25 bg-souls-void/60 px-3 py-2 text-sm outline-none"
        type="search"
        aria-label="Search artifacts"
        placeholder="Search artifacts…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="my-3 flex flex-wrap gap-1" aria-label="Artifact rarity">
        {["all", "primal", "mythic", "legendary"].map((value) => (
          <button key={value} className="race-filter" aria-pressed={rarity === value} onClick={() => setRarity(value)}>
            {value}
          </button>
        ))}
      </div>
      {selectedId && (
        <button className="formation-action mb-3" onClick={() => onSelect(null)}>
          <X size={16} /> Remove artifact
        </button>
      )}
      <div className="picker-roster">
        {options.map((item) => (
          <button
            className="roster-unit"
            key={item.id}
            data-selected={selectedId === item.id}
            aria-pressed={selectedId === item.id}
            onClick={() => onSelect(item.id)}
          >
            <img src={item.imageUrl} alt="" loading="lazy" />
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      {!options.length && <p className="py-6 text-center text-sm text-souls-panel">No artifacts match your search.</p>}
    </aside>
  );
}
