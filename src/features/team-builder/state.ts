export type Team = { slots: (string | null)[]; petId: string | null };
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
  return { ...team, slots };
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
      return {
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
    return `${positions || "-"}/${team.petId || "-"}`;
  };
  url.hash = `setup=2/${encodeTeam(matchup.enemy)}/${encodeTeam(matchup.ally)}`;
  return url.toString();
}

export function readSharedMatchup(hash: string, heroIds: Set<string>, petIds: Set<string>): Matchup | null {
  try {
    const raw = new URLSearchParams(hash.replace(/^#/, "")).get("setup");
    if (!raw || raw.length > 10000) return null;
    if (raw.startsWith("2/")) {
      const parts = raw.split("/");
      if (parts.length !== 5) return null;
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
      return { enemy: decodeTeam(parts[1], parts[2]), ally: decodeTeam(parts[3], parts[4]) };
    }
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.enemy?.slots) || !Array.isArray(value.ally?.slots)) return null;
    return restoreMatchup(raw, heroIds, petIds);
  } catch {
    return null;
  }
}
