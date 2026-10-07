import { describe, expect, it } from "vitest";
import { calculateRelicResources } from "./relicUpgradeCosts";

describe("relic resource calculations", () => {
  it("splits costs at the current level without counting a transition twice", () => {
    const { spent, required } = calculateRelicResources([{ current: 10, target: 20, isSeal: false }]);
    expect(spent.forgottenWaterOfLife).toBe(1050);
    expect(spent.forgottenForestEssence).toBe(60);
    expect(required.forgottenWaterOfLife).toBe(1600);
    expect(required.forgottenForestEssence).toBe(640);
    expect(required.forgottenFlowerBud).toBe(30);
    expect(required.clockOfMemories).toBe(0);
  });
  it("aggregates all twelve relics and keeps seal resources separate", () => {
    const selections = Array.from({ length: 12 }, (_, index) => ({ current: 0, target: 60, isSeal: index % 4 >= 2 }));
    const { spent, required } = calculateRelicResources(selections);
    expect(Object.values(spent).every((value) => value === 0)).toBe(true);
    expect(required).toEqual({
      forgottenWaterOfLife: 162600,
      forgottenForestEssence: 57300,
      forgottenFlowerBud: 3780,
      clockOfMemories: 162600,
      compassOfMemories: 57300,
      keyOfMemories: 3780,
    });
  });
  it("counts attained levels as spent even when no upgrade is requested", () => {
    const { spent, required } = calculateRelicResources([{ current: 60, target: 60, isSeal: true }]);
    expect(spent.clockOfMemories).toBe(27100);
    expect(spent.compassOfMemories).toBe(9550);
    expect(spent.keyOfMemories).toBe(630);
    expect(Object.values(required).every((value) => value === 0)).toBe(true);
    expect(
      Object.values(calculateRelicResources([{ current: 0, target: 0, isSeal: false }]).spent).every(
        (value) => value === 0,
      ),
    ).toBe(true);
  });
  it("preserves milestone costs for 49 to 50 and 59 to 60", () => {
    expect(calculateRelicResources([{ current: 49, target: 50, isSeal: false }]).required).toMatchObject({
      forgottenWaterOfLife: 700,
      forgottenForestEssence: 350,
      forgottenFlowerBud: 90,
    });
    expect(calculateRelicResources([{ current: 59, target: 60, isSeal: true }]).required).toMatchObject({
      clockOfMemories: 1000,
      compassOfMemories: 450,
      keyOfMemories: 110,
    });
  });
});
