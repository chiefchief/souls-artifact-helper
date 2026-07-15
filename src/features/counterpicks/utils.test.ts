import { describe, expect, it } from "vitest";
import type { Hero } from "../../heroes/heroes";
import { getCounterpickResults } from "./utils";

function hero(id: string, name: string, counterpicks: Hero["counterpicks"] = []): Hero {
  return {
    id,
    name,
    rarity: "epic",
    race: "human",
    role: "dealer",
    attribute: "strength",
    imageUrl: "",
    skills: [],
    counterpicks,
  };
}

describe("getCounterpickResults", () => {
  it("aggregates shared counterpicks and sorts by descending total", () => {
    const results = getCounterpickResults(
      [
        hero("a", "Target A", [
          { heroId: "c", rating: 1 },
          { heroId: "b", rating: 1 },
        ]),
        hero("b", "Bravo"),
        hero("c", "Charlie"),
        hero("d", "Target D", [{ heroId: "c", rating: 1 }]),
      ],
      ["a", "d"],
    );

    expect(results.map(({ hero: resultHero, score }) => [resultHero.id, score])).toEqual([
      ["c", 2],
      ["b", 1],
    ]);
  });

  it("excludes selected targets and unknown heroes while keeping each result unique", () => {
    const results = getCounterpickResults(
      [
        hero("a", "Target A", [
          { heroId: "a", rating: 5 },
          { heroId: "b", rating: 1 },
          { heroId: "missing", rating: 1 },
        ]),
        hero("b", "Bravo", [{ heroId: "c", rating: 1 }]),
        hero("c", "Charlie"),
      ],
      ["a", "b"],
    );

    expect(results.map(({ hero: resultHero }) => resultHero.id)).toEqual(["c"]);
  });
});
