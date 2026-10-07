import { relicStatBonuses, relicStats, type RelicSlot } from "../data/relicStatBonuses";
import { expect, it } from "vitest";
import { getRelicStats, calculateRelicStatProgress } from "./relicStatBonuses";
it("starts bonuses at their unlock levels", () => {
  expect(getRelicStats("topLeft", 0).atk).toBe(0);
  expect(getRelicStats("topLeft", 9).hp).toBe(0);
  expect(getRelicStats("topLeft", 10)).toMatchObject({ atk: 4.4, hp: 0.2 });
  expect(getRelicStats("bottomLeft", 19).spd).toBe(0);
  expect(getRelicStats("bottomLeft", 20).spd).toBe(2);
  expect(getRelicStats("topRight", 49).critDef).toBe(0);
  expect(getRelicStats("topRight", 50).critDef).toBe(0);
  expect(getRelicStats("topRight", 51).critDef).toBe(3);
});
it("reads the user-corrected maximum bonuses", () => {
  expect(getRelicStats("topLeft", 60)).toMatchObject({ atk: 31.9, hp: 15.6 });
  expect(getRelicStats("topRight", 60)).toMatchObject({ def: 33, hp: 17.8, critDef: 8 });
  expect(getRelicStats("bottomLeft", 60)).toMatchObject({ hp: 26.4, def: 41.3, spd: 20 });
  expect(getRelicStats("bottomRight", 60)).toMatchObject({ hp: 23.1, atk: 31.3, critDmg: 23.5 });
});
it("averages stat ratios while excluding bonuses not yet unlocked", () => {
  expect(calculateRelicStatProgress([{ slot: "topLeft", current: 5, target: 10 }]).progress).toBeCloseTo(
    (2 / 4.4 / 2) * 100,
  );
  expect(calculateRelicStatProgress([{ slot: "topRight", current: 60, target: 60 }]).progress).toBe(100);
  expect(calculateRelicStatProgress([]).progress).toBe(0);
});

it("has all 61 levels with finite nondecreasing bonuses for each slot", () => {
  for (const slot of Object.keys(relicStatBonuses) as RelicSlot[]) {
    expect(Object.keys(relicStatBonuses[slot]).map(Number)).toEqual(Array.from({ length: 61 }, (_, level) => level));
    for (let level = 0; level <= 60; level++) {
      const current = getRelicStats(slot, level);
      const previous = getRelicStats(slot, Math.max(0, level - 1));
      for (const { id } of relicStats) {
        expect(Number.isFinite(current[id])).toBe(true);
        expect(current[id]).toBeGreaterThanOrEqual(previous[id]);
      }
    }
  }
});

it("preserves bottom-left speed plateaus and milestone increases", () => {
  for (const [level, spd] of [
    [20, 2],
    [24, 2],
    [25, 4],
    [29, 4],
    [30, 7],
    [35, 10],
    [40, 13],
    [45, 16],
    [49, 16],
    [50, 20],
    [55, 20],
    [60, 20],
  ]) {
    expect(getRelicStats("bottomLeft", level).spd).toBe(spd);
  }
});
