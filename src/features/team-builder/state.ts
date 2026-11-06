import { canEquipArtifact } from "../../data/artifactEquipment";
import { heroes } from "../../heroes/heroes";

const heroRoles = new Map(heroes.map((hero) => [String(hero.id), hero.role]));
import { isHeroRune, type HeroRune } from "./runes";

export type Team = {
  slots: (string | null)[];
  petId: string | null;
  runes?: Record<string, HeroRune>;
  artifacts?: Record<string, string>;
};
export type Matchup = { enemy: Team; ally: Team };
export const emptyTeam = (): Team => ({ slots: Array(8).fill(null), petId: null });
export const emptyMatchup = (): Matchup => ({ enemy: emptyTeam(), ally: emptyTeam() });

// Selecting a hero already on the board moves them, or swaps occupied positions.
export function placeHero(team: Team, slot: number, id: string | null): Team {
  if (slot < 0 || slot >= 8) return team;
  const previous = id === null ? -1 : team.slots.indexOf(id);
  if (id && previous === -1 && !team.slots[slot] && team.slots.filter(Boolean).length >= 5) return team;
  const slots = [...team.slots];
  if (previous !== -1) slots[previous] = slots[slot];
  slots[slot] = id;
  const artifacts = Object.fromEntries(
    Object.entries(team.artifacts ?? {}).filter(([heroId]) => slots.includes(heroId)),
  );
  const next = { ...team, slots };
  if (Object.keys(artifacts).length) next.artifacts = artifacts;
  else delete next.artifacts;
  const runes = Object.fromEntries(Object.entries(team.runes ?? {}).filter(([heroId]) => slots.includes(heroId)));
  if (Object.keys(runes).length) next.runes = runes;
  else delete next.runes;
  return next;
}

export function equipRune(team: Team, heroId: string, rune: HeroRune | null): Team {
  if (!team.slots.includes(heroId) || (rune !== null && !isHeroRune(rune))) return team;
  const runes = { ...team.runes };
  if (rune) runes[heroId] = { ...rune };
  else delete runes[heroId];
  const next = { ...team };
  if (Object.keys(runes).length) next.runes = runes;
  else delete next.runes;
  return next;
}

export function equipArtifact(team: Team, heroId: string, artifactId: string | null): Team {
  if (!team.slots.includes(heroId) || (artifactId !== null && !canEquipArtifact(heroRoles.get(heroId), artifactId)))
    return team;
  const artifacts = { ...team.artifacts };
  if (artifactId) artifacts[heroId] = artifactId;
  else delete artifacts[heroId];
  const next = { ...team };
  if (Object.keys(artifacts).length) next.artifacts = artifacts;
  else delete next.artifacts;
  return next;
}

export function restoreMatchup(raw: string | null, heroIds: Set<string>, petIds: Set<string>): Matchup {
  try {
    const value = JSON.parse(raw ?? "null");
    const readTeam = (team: unknown): Team => {
      if (!team || typeof team !== "object") return emptyTeam();
      const candidate = team as Partial<Team>;
      const used = new Set<string>();
      const slots = Array.from({ length: 8 }, (_, index) => {
        const id = Array.isArray(candidate.slots) ? candidate.slots[index] : null;
        if (typeof id !== "string" || !heroIds.has(id) || used.has(id) || used.size >= 5) return null;
        used.add(id);
        return id;
      });
      const artifacts = Object.fromEntries(
        Object.entries(
          candidate.artifacts && typeof candidate.artifacts === "object" ? candidate.artifacts : {},
        ).filter(
          ([heroId, artifactId]) =>
            used.has(heroId) && typeof artifactId === "string" && canEquipArtifact(heroRoles.get(heroId), artifactId),
        ),
      );
      const runes = Object.fromEntries(
        Object.entries(candidate.runes && typeof candidate.runes === "object" ? candidate.runes : {}).filter(
          ([heroId, rune]) => used.has(heroId) && isHeroRune(rune),
        ),
      );
      return {
        ...(Object.keys(runes).length ? { runes } : {}),
        ...(Object.keys(artifacts).length ? { artifacts } : {}),
        slots,
        petId: typeof candidate.petId === "string" && petIds.has(candidate.petId) ? candidate.petId : null,
      };
    };
    return { enemy: readTeam(value?.enemy), ally: readTeam(value?.ally) };
  } catch {
    return emptyMatchup();
  }
}

export function shareMatchup(matchup: Matchup, pageUrl: string): string {
  const url = new URL(pageUrl);
  const encodeTeam = (team: Team) => {
    const positions = team.slots.flatMap((id, index) => (id ? [`${index + 1}-${id}`] : [])).join(",");
    const equipment = team.slots
      .flatMap((id, index) => (id && team.artifacts?.[id] ? [`${index + 1}-${team.artifacts[id]}`] : []))
      .join(",");
    const runes = team.slots
      .flatMap((id, index) => {
        const rune = id ? team.runes?.[id] : null;
        return rune ? [`${index + 1}-${rune.runeId}-${rune.ability ?? 0}`] : [];
      })
      .join(",");
    return `${positions || "-"}/${team.petId || "-"}/${equipment || "-"}/${runes || "-"}`;
  };
  url.hash = `setup=4/${encodeTeam(matchup.enemy)}/${encodeTeam(matchup.ally)}`;
  return url.toString();
}

export function readSharedMatchup(hash: string, heroIds: Set<string>, petIds: Set<string>): Matchup | null {
  try {
    const raw = new URLSearchParams(hash.replace(/^#/, "")).get("setup");
    if (!raw || raw.length > 10000) return null;
    if (raw.startsWith("2/") || raw.startsWith("3/") || raw.startsWith("4/")) {
      const parts = raw.split("/");
      const withRunes = parts[0] === "4";
      const withArtifacts = parts[0] === "3" || withRunes;
      if (parts.length !== (withRunes ? 9 : withArtifacts ? 7 : 5)) return null;
      const decodeTeam = (positions: string, pet: string): Team => {
        const team = emptyTeam();
        if (pet !== "-" && !petIds.has(pet)) throw new Error("Unknown pet");
        team.petId = pet === "-" ? null : pet;
        if (positions === "-") return team;
        const used = new Set<string>();
        for (const position of positions.split(",")) {
          const match = /^([1-8])-([a-z0-9_-]+)$/.exec(position);
          if (
            !match ||
            !heroIds.has(match[2]) ||
            used.has(match[2]) ||
            used.size >= 5 ||
            team.slots[Number(match[1]) - 1]
          )
            throw new Error("Invalid position");
          used.add(match[2]);
          team.slots[Number(match[1]) - 1] = match[2];
        }
        return team;
      };
      const decodeEquipment = (team: Team, equipment: string) => {
        if (equipment === "-") return team;
        for (const entry of equipment.split(",")) {
          const match = /^([1-8])-([a-z0-9_-]+)$/.exec(entry);
          const heroId = match ? team.slots[Number(match[1]) - 1] : null;
          if (!match || !heroId || !canEquipArtifact(heroRoles.get(heroId), match[2]) || team.artifacts?.[heroId])
            throw new Error("Invalid artifact");
          team = equipArtifact(team, heroId, match[2]);
        }
        return team;
      };
      const decodeRunes = (team: Team, encoded: string) => {
        if (encoded === "-") return team;
        for (const entry of encoded.split(",")) {
          const match = /^([1-8])-(\d{5}_[1-5])-([0-6])$/.exec(entry);
          const heroId = match ? team.slots[Number(match[1]) - 1] : null;
          const rune = match ? { runeId: match[2], ability: Number(match[3]) || null } : null;
          if (!heroId || !isHeroRune(rune) || team.runes?.[heroId]) throw new Error("Invalid rune");
          team = equipRune(team, heroId, rune);
        }
        return team;
      };
      if (withRunes)
        return {
          enemy: decodeRunes(decodeEquipment(decodeTeam(parts[1], parts[2]), parts[3]), parts[4]),
          ally: decodeRunes(decodeEquipment(decodeTeam(parts[5], parts[6]), parts[7]), parts[8]),
        };
      return withArtifacts
        ? {
            enemy: decodeEquipment(decodeTeam(parts[1], parts[2]), parts[3]),
            ally: decodeEquipment(decodeTeam(parts[4], parts[5]), parts[6]),
          }
        : { enemy: decodeTeam(parts[1], parts[2]), ally: decodeTeam(parts[3], parts[4]) };
    }
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.enemy?.slots) || !Array.isArray(value.ally?.slots)) return null;
    return restoreMatchup(raw, heroIds, petIds);
  } catch {
    return null;
  }
}
