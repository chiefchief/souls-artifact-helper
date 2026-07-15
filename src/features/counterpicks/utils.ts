import type { Hero, HeroId } from "../../heroes/heroes";

export type CounterpickResult = {
  hero: Hero;
  score: number;
};

export function getCounterpickResults(allHeroes: Hero[], targetIds: HeroId[]): CounterpickResult[] {
  const heroesById = new Map(allHeroes.map((hero) => [hero.id, hero]));
  const selectedTargetIds = new Set(targetIds);
  const scores = new Map<HeroId, number>();

  for (const targetId of selectedTargetIds) {
    const target = heroesById.get(targetId);
    if (!target) {
      continue;
    }

    for (const counterpick of target.counterpicks ?? []) {
      if (selectedTargetIds.has(counterpick.heroId) || !heroesById.has(counterpick.heroId)) {
        continue;
      }

      scores.set(counterpick.heroId, (scores.get(counterpick.heroId) ?? 0) + counterpick.rating);
    }
  }

  return [...scores.entries()]
    .map(([heroId, score]) => ({ hero: heroesById.get(heroId)!, score }))
    .sort((a, b) => b.score - a.score || a.hero.name.localeCompare(b.hero.name));
}
