import costs from "../data/relicUpgradeCosts.json";

export const relicResources = [
  { id: "forgottenWaterOfLife", name: "Forgotten Water of Life", image: "forgotten-water-of-life.png" },
  { id: "forgottenForestEssence", name: "Forgotten Forest Essence", image: "forgotten-forest-essence.png" },
  { id: "forgottenFlowerBud", name: "Forgotten Flower Bud", image: "forgotten-flower-bud.png" },
  { id: "clockOfMemories", name: "Clock of Memories", image: "clock-of-memories.png" },
  { id: "compassOfMemories", name: "Compass of Memories", image: "compass-of-memories.png" },
  { id: "keyOfMemories", name: "Key of Memories", image: "key-of-memories.png" },
] as const;

export type RelicResource = (typeof relicResources)[number]["id"];
export type RelicResourceTotals = Record<RelicResource, number>;
type UpgradeSelection = { current: number; target: number; isSeal: boolean };
type CostRow = { level: number } & Partial<RelicResourceTotals>;

function emptyTotals(): RelicResourceTotals {
  return Object.fromEntries(relicResources.map(({ id }) => [id, 0])) as RelicResourceTotals;
}

export function calculateRelicResources(selections: UpgradeSelection[]) {
  const spent = emptyTotals();
  const required = emptyTotals();
  for (const { current, target, isSeal } of selections) {
    if (!Number.isInteger(current) || !Number.isInteger(target) || current < 0 || target > 60 || current > target) {
      throw new RangeError("Expected relic levels 0 <= current <= target <= 60.");
    }
    const rows: CostRow[] = isSeal ? costs.seal : costs.nonSeal;
    for (const row of rows) {
      if (row.level >= target) break;
      const totals = row.level < current ? spent : required;
      for (const { id } of relicResources) totals[id] += row[id] ?? 0;
    }
  }
  return { spent, required };
}
