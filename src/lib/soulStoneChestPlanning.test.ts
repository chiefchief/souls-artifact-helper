import { describe, expect, it } from "vitest";
import {
  findOptimalChestUsage,
  getSelectionValue,
  solveBalancedUsage,
  solveMinimalUsage,
  type ChestPlanningOption,
} from "./soulStoneChestPlanning";

const realInventory = [
  { available: 922, value: 232 },
  { available: 205, value: 696 },
  { available: 112, value: 1392 },
  { available: 96, value: 2785 },
  { available: 196, value: 5571 },
];

describe("Soul Stone chest planning", () => {
  it("reproduces the verified real-inventory plans", () => {
    const deficit = 359_820;
    const minimalUsage = solveMinimalUsage(deficit, realInventory);
    const balancedUsage = solveBalancedUsage(deficit, realInventory);

    expect(minimalUsage).not.toBeNull();
    expect(getSelectionValue(minimalUsage!, realInventory) - deficit).toBe(12);

    expect(balancedUsage).toEqual([177, 40, 21, 18, 38]);
    expect(getSelectionValue(balancedUsage!, realInventory) - deficit).toBe(144);
  });

  it("matches exhaustive search for small inventories in both modes", () => {
    const inventories: ChestPlanningOption[][] = [
      [
        { available: 3, value: 2 },
        { available: 2, value: 5 },
        { available: 2, value: 9 },
      ],
      [
        { available: 2, value: 3 },
        { available: 3, value: 7 },
        { available: 1, value: 11 },
        { available: 2, value: 16 },
      ],
      [
        { available: 1, value: 4 },
        { available: 2, value: 6 },
        { available: 3, value: 13 },
      ],
    ];

    inventories.forEach((chests) => {
      const totalAvailable = getSelectionValue(
        chests.map((chest) => chest.available),
        chests,
      );

      for (let deficit = 1; deficit <= totalAvailable; deficit += 1) {
        const allPlans = enumerateAllPlans(chests).filter((counts) => getSelectionValue(counts, chests) >= deficit);

        const minimalUsage = findOptimalChestUsage(deficit, chests, "min-overuse");
        const expectedMinimal = getBestMinimalPlan(allPlans, chests, deficit);
        expect(getMinimalObjective(minimalUsage!, chests, deficit)).toEqual(
          getMinimalObjective(expectedMinimal, chests, deficit),
        );

        const balancedUsage = findOptimalChestUsage(deficit, chests, "balanced");
        const expectedBalanced = getBestBalancedPlan(allPlans, chests, deficit);
        expect(getBalancedObjective(balancedUsage!, chests, deficit)).toEqual(
          getBalancedObjective(expectedBalanced, chests, deficit),
        );
      }
    });
  });

  it("handles a maximum-upgrade-sized plan without the previous exhaustive range", () => {
    const chests = [
      { available: 381, value: 232 },
      { available: 73, value: 696 },
      { available: 87, value: 1392 },
      { available: 70, value: 2785 },
      { available: 215, value: 5571 },
    ];
    const deficit = 1_548_000;
    const startedAt = Date.now();

    const minimalUsage = findOptimalChestUsage(deficit, chests, "min-overuse");
    const balancedUsage = findOptimalChestUsage(deficit, chests, "balanced");

    expect(minimalUsage).not.toBeNull();
    expect(balancedUsage).not.toBeNull();
    expect(getSelectionValue(minimalUsage!, chests)).toBeGreaterThanOrEqual(deficit);
    expect(getSelectionValue(balancedUsage!, chests)).toBeGreaterThanOrEqual(deficit);
    expect(Date.now() - startedAt).toBeLessThan(3_000);
  });
});

function enumerateAllPlans(chests: ChestPlanningOption[]) {
  const plans: number[][] = [];
  const counts = chests.map(() => 0);

  function visit(index: number) {
    if (index === chests.length) {
      plans.push([...counts]);
      return;
    }

    for (let count = 0; count <= chests[index].available; count += 1) {
      counts[index] = count;
      visit(index + 1);
    }
  }

  visit(0);
  return plans;
}

function getBestMinimalPlan(plans: number[][], chests: ChestPlanningOption[], deficit: number) {
  return [...plans].sort((first, second) => {
    const firstObjective = getMinimalObjective(first, chests, deficit);
    const secondObjective = getMinimalObjective(second, chests, deficit);
    return firstObjective[0] - secondObjective[0] || firstObjective[1] - secondObjective[1];
  })[0];
}

function getBestBalancedPlan(plans: number[][], chests: ChestPlanningOption[], deficit: number) {
  const minOverflow = Math.min(...plans.map((counts) => getSelectionValue(counts, chests) - deficit));
  const overflowLimit = Math.max(minOverflow, Math.floor(chests[0].value * 0.8));

  return plans
    .filter((counts) => getSelectionValue(counts, chests) - deficit <= overflowLimit)
    .sort((first, second) => {
      const firstObjective = getBalancedObjective(first, chests, deficit);
      const secondObjective = getBalancedObjective(second, chests, deficit);
      return (
        firstObjective[0] - secondObjective[0] ||
        firstObjective[1] - secondObjective[1] ||
        firstObjective[2] - secondObjective[2]
      );
    })[0];
}

function getMinimalObjective(counts: number[], chests: ChestPlanningOption[], deficit: number) {
  return [getSelectionValue(counts, chests) - deficit, counts.reduce((sum, count) => sum + count, 0)];
}

function getBalancedObjective(counts: number[], chests: ChestPlanningOption[], deficit: number) {
  const totalAvailable = getSelectionValue(
    chests.map((chest) => chest.available),
    chests,
  );
  const targetFraction = deficit / totalAvailable;
  const score = counts.reduce(
    (sum, count, index) =>
      sum + (chests[index].available > 0 ? Math.abs(count / chests[index].available - targetFraction) : 0),
    0,
  );

  return [
    Number(score.toFixed(12)),
    getSelectionValue(counts, chests) - deficit,
    counts.reduce((sum, count) => sum + count, 0),
  ];
}
