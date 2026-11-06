import { Hexagon, Plus } from "lucide-react";
import { heroFaceImageUrl } from "../../heroes/faceImages";
import { heroes } from "../../heroes/heroes";
import { formationArtifactById } from "./ArtifactPicker";
import { RuneIcon } from "./RuneIcon";
import { mapHeroRuneToAppearance, runeAbilityByKey, runeByType } from "./runes";
import type { Team } from "./state";

export function TeamEquipment({
  team,
  teamName,
  selectedSlot,
  onHero,
  onRune,
  onArtifact,
}: {
  team: Team;
  teamName: string;
  selectedSlot: number | "pet" | null;
  onHero: (slot: number) => void;
  onRune: (slot: number) => void;
  onArtifact: (slot: number) => void;
}) {
  return (
    <div className="team-equipment" role="group" aria-label={`${teamName} equipment`}>
      {!team.slots.some(Boolean) && <p className="equipment-empty">Add heroes to equip them.</p>}
      {team.slots.map((id, slot) => {
        const hero = heroes.find((item) => item.id === id);
        if (!hero) return null;
        const savedRune = team.runes?.[hero.id];
        const rune = savedRune ? mapHeroRuneToAppearance(savedRune) : null;
        const artifact = formationArtifactById.get(team.artifacts?.[hero.id] ?? "");
        const runeName = rune
          ? `${runeByType.get(rune.rune)?.name}${rune.ability ? ` · ${runeAbilityByKey.get(rune.ability)?.name}` : ""}`
          : "Add rune";
        return (
          <div className="equipment-row" key={hero.id} data-selected={selectedSlot === slot}>
            <button
              className="equipment-icon equipment-hero"
              title={`Position ${slot + 1} · ${hero.name}`}
              aria-label={`Select ${hero.name} at ${teamName} position ${slot + 1}`}
              onClick={() => onHero(slot)}
            >
              <span className="equipment-portrait">
                <img src={heroFaceImageUrl(hero)} alt="" />
              </span>
            </button>
            <button
              className="equipment-icon equipment-rune"
              title={runeName}
              aria-label={`${rune ? "Change rune" : "Add rune"} for ${hero.name}`}
              onClick={() => onRune(slot)}
            >
              {rune ? (
                <RuneIcon {...rune} />
              ) : (
                <>
                  <Hexagon className="equipment-rune-outline" strokeWidth={1} />
                  <Plus size={18} />
                </>
              )}
            </button>
            <button
              className="equipment-icon"
              title={artifact?.name ?? "Add artifact"}
              aria-label={`${artifact ? `Change ${artifact.name}` : "Add artifact"} for ${hero.name}`}
              onClick={() => onArtifact(slot)}
            >
              {artifact ? <img src={artifact.imageUrl} alt="" /> : <Plus size={20} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
