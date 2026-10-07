import { relicStatBonuses, relicStats, type RelicSlot, type RelicStat } from "../data/relicStatBonuses";
export type RelicStatTotals = Record<RelicStat, number>;
function emptyStats(): RelicStatTotals {
  return Object.fromEntries(relicStats.map(({ id }) => [id, 0])) as RelicStatTotals;
}
export function getRelicStats(slot: RelicSlot, level: number): RelicStatTotals {
  if (!Number.isInteger(level) || level < 0 || level > 60) {
    throw new RangeError("Expected a relic level between 0 and 60.");
  }
  return { ...emptyStats(), ...relicStatBonuses[slot][level] };
}
export function calculateRelicStatProgress(selections: { slot: RelicSlot; current: number; target: number }[]) {
  const current = emptyStats();
  const target = emptyStats();
  for (const selection of selections) {
    const from = getRelicStats(selection.slot, selection.current);
    const to = getRelicStats(selection.slot, selection.target);
    for (const { id } of relicStats) {
      current[id] += from[id];
      target[id] += to[id];
    }
  }
  const activeStats = relicStats.filter(({ id }) => target[id] > 0);
  const progress = activeStats.length
    ? (activeStats.reduce((sum, { id }) => sum + current[id] / target[id], 0) / activeStats.length) * 100
    : 0;
  return { current, target, progress };
}
