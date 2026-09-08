import { describe, expect, it } from "vitest";
import { emptyTeam, placeHero, restoreMatchup, shareMatchup, readSharedMatchup } from "./state";

describe("team formations", () => {
  it("limits each team to five heroes but allows replacements", () => {
    let team = emptyTeam();
    for (let i = 0; i < 5; i++) team = placeHero(team, i, `hero${i}`);
    expect(placeHero(team, 5, "extra")).toEqual(team);
    expect(placeHero(team, 0, "extra").slots[0]).toBe("extra");
  });
  it("moves existing heroes and swaps occupied positions without duplicates", () => {
    let team = placeHero(placeHero(emptyTeam(), 0, "a"), 1, "b");
    team = placeHero(team, 1, "a");
    expect(team.slots.slice(0, 2)).toEqual(["b", "a"]);
    team = placeHero(team, 7, "a");
    expect(team.slots[1]).toBeNull();
    expect(team.slots[7]).toBe("a");
    expect(placeHero(team, 7, null).slots[7]).toBeNull();
  });
  it("restores independent teams and pets, dropping stale and duplicate entries", () => {
    const result = restoreMatchup(
      JSON.stringify({ enemy: { slots: ["a", "a", "old"], petId: "p" }, ally: { slots: ["a"], petId: "old" } }),
      new Set(["a"]),
      new Set(["p"]),
    );
    expect(result.enemy.slots).toEqual(["a", null, null, null, null, null, null, null]);
    expect(result.ally.slots[0]).toBe("a");
    expect(result.enemy.petId).toBe("p");
    expect(result.ally.petId).toBeNull();
    expect(restoreMatchup("broken", new Set(), new Set()).enemy).toEqual(emptyTeam());
  });
});

describe("shared formations", () => {
  it("round trips positions on both sides and pets independently of local state", () => {
    const matchup = {
      enemy: { slots: [null, "a", null, null, null, null, null, "b"], petId: "p" },
      ally: { slots: ["b", null, null, null, "a", null, null, null], petId: "q" },
    };
    const url = new URL(shareMatchup(matchup, "https://example.com/souls/team-builder#old"));
    expect(url.pathname).toBe("/souls/team-builder");
    expect(readSharedMatchup(url.hash, new Set(["a", "b"]), new Set(["p", "q"]))).toEqual(matchup);
    matchup.enemy.slots[1] = null;
    expect(readSharedMatchup(url.hash, new Set(["a", "b"]), new Set(["p", "q"]))?.enemy.slots[1]).toBe("a");
  });
  it("rejects malformed links and unsupported versions", () => {
    for (const hash of [
      "",
      "#setup=broken",
      "#setup=null",
      "#setup=" + encodeURIComponent(JSON.stringify({ version: 2, enemy: { slots: [] }, ally: { slots: [] } })),
    ]) {
      expect(readSharedMatchup(hash, new Set(), new Set())).toBeNull();
    }
  });
});

it("keeps legacy JSON links working", () => {
  const matchup = { enemy: emptyTeam(), ally: placeHero(emptyTeam(), 3, "a") };
  const hash = "#setup=" + encodeURIComponent(JSON.stringify({ version: 1, ...matchup }));
  expect(readSharedMatchup(hash, new Set(["a"]), new Set())).toEqual(matchup);
});

it("rejects invalid compact positions", () => {
  for (const hash of [
    "#setup=2/9-a/-/-/-",
    "#setup=2/1-a,2-a/-/-/-",
    "#setup=2/1-a,1-b/-/-/-",
    "#setup=2/-/unknown/-/-",
    "#setup=2/1-unknown/-/-/-",
  ]) {
    expect(readSharedMatchup(hash, new Set(["a", "b"]), new Set())).toBeNull();
  }
});
