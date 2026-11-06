import { describe, expect, it } from "vitest";
import {
  emptyTeam,
  equipArtifact,
  equipRune,
  placeHero,
  restoreMatchup,
  shareMatchup,
  readSharedMatchup,
} from "./state";

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

describe("hero artifacts", () => {
  it("rejects incompatible equipment when assigning, restoring or opening a shared setup", () => {
    const healer = placeHero(emptyTeam(), 0, "aolmond");
    expect(equipArtifact(healer, "aolmond", "mythic-19")).toBe(healer);
    expect(equipArtifact(healer, "aolmond", "mythic-23").artifacts).toEqual({ aolmond: "mythic-23" });
    expect(equipArtifact(healer, "aolmond", "mythic-04").artifacts).toEqual({ aolmond: "mythic-04" });
    const tank = placeHero(emptyTeam(), 0, "richelle");
    expect(equipArtifact(tank, "richelle", "mythic-19").artifacts).toEqual({ richelle: "mythic-19" });
    expect(equipArtifact(tank, "richelle", "mythic-23")).toBe(tank);
    const heroIds = new Set(["aolmond", "richelle"]);
    const restored = restoreMatchup(
      JSON.stringify({ ally: { ...healer, artifacts: { aolmond: "mythic-19" } } }),
      heroIds,
      new Set(),
    );
    expect(restored.ally.slots[0]).toBe("aolmond");
    expect(restored.ally.artifacts).toBeUndefined();
    expect(readSharedMatchup("#setup=4/1-aolmond/-/1-mythic-19/-/-/-/-/-", heroIds, new Set())).toBeNull();
    expect(
      readSharedMatchup("#setup=4/1-aolmond/-/1-mythic-23/-/-/-/-/-", heroIds, new Set())?.enemy.artifacts,
    ).toEqual({ aolmond: "mythic-23" });
  });
  it("keeps artifacts with heroes when moving and swapping, and clears removed heroes", () => {
    let team = placeHero(placeHero(emptyTeam(), 0, "a"), 1, "b");
    team = equipArtifact(equipArtifact(team, "a", "mythic-03"), "b", "primal-02");
    team = placeHero(team, 1, "a");
    expect(team.slots.slice(0, 2)).toEqual(["b", "a"]);
    expect(team.artifacts).toEqual({ a: "mythic-03", b: "primal-02" });
    team = placeHero(team, 7, "a");
    expect(team.artifacts?.a).toBe("mythic-03");
    team = placeHero(team, 7, "c");
    expect(team.artifacts).toEqual({ b: "primal-02" });
    expect(placeHero(team, 0, null).artifacts).toBeUndefined();
  });

  it("allows removing equipment and rejects unknown artifacts or absent heroes", () => {
    const team = placeHero(emptyTeam(), 0, "a");
    expect(equipArtifact(team, "b", "mythic-03")).toBe(team);
    expect(equipArtifact(team, "a", "unknown")).toBe(team);
    expect(equipArtifact(equipArtifact(team, "a", "mythic-03"), "a", null)).toEqual(team);
  });

  it("round trips independent equipment for the same hero on opposing teams", () => {
    const matchup = {
      enemy: equipArtifact(placeHero(emptyTeam(), 0, "a"), "a", "mythic-03"),
      ally: equipArtifact(placeHero(emptyTeam(), 7, "a"), "a", "primal-02"),
    };
    const heroIds = new Set(["a"]);
    const url = new URL(shareMatchup(matchup, "https://example.com/team-builder"));
    expect(readSharedMatchup(url.hash, heroIds, new Set())).toEqual(matchup);
    expect(restoreMatchup(JSON.stringify(matchup), heroIds, new Set())).toEqual(matchup);
  });

  it("drops stale equipment from storage and rejects invalid equipment in links", () => {
    const result = restoreMatchup(
      JSON.stringify({
        enemy: {
          slots: ["a", "b"],
          artifacts: { a: "mythic-03", b: "unknown", c: "primal-02" },
        },
      }),
      new Set(["a", "b"]),
      new Set(),
    );
    expect(result.enemy.artifacts).toEqual({ a: "mythic-03" });
    for (const equipment of ["1-unknown", "2-mythic-03", "1-mythic-03,1-primal-02"]) {
      expect(readSharedMatchup(`#setup=3/1-a/-/${equipment}/-/-/-`, new Set(["a"]), new Set())).toBeNull();
    }
  });

  it("opens existing compact links without equipment", () => {
    expect(readSharedMatchup("#setup=2/1-a/-/-/-", new Set(["a"]), new Set())).toEqual({
      enemy: placeHero(emptyTeam(), 0, "a"),
      ally: emptyTeam(),
    });
  });
});

describe("hero runes", () => {
  it("keeps a rune and its optional ability with its hero across movement and swaps", () => {
    let team = placeHero(placeHero(emptyTeam(), 0, "a"), 1, "b");
    team = equipRune(team, "a", { runeId: "80001_5", ability: 6 });
    team = equipRune(team, "b", { runeId: "80101_5", ability: null });
    team = placeHero(team, 1, "a");
    expect(team.slots.slice(0, 2)).toEqual(["b", "a"]);
    expect(team.runes).toEqual({ a: { runeId: "80001_5", ability: 6 }, b: { runeId: "80101_5", ability: null } });
    team = placeHero(team, 7, "a");
    expect(team.runes?.a.ability).toBe(6);
    team = placeHero(team, 7, "c");
    expect(team.runes?.a).toBeUndefined();
    expect(equipRune(team, "b", null).runes).toBeUndefined();
  });

  it("round trips runes with and without abilities alongside artifacts and pets", () => {
    const matchup = {
      enemy: equipRune(equipArtifact({ ...placeHero(emptyTeam(), 2, "a"), petId: "p" }, "a", "mythic-03"), "a", {
        runeId: "81101_5",
        ability: 3,
      }),
      ally: equipRune(placeHero(emptyTeam(), 7, "a"), "a", { runeId: "80001_5", ability: null }),
    };
    const heroIds = new Set(["a"]),
      petIds = new Set(["p"]);
    const hash = new URL(shareMatchup(matchup, "https://example.com/team-builder")).hash;
    expect(readSharedMatchup(hash, heroIds, petIds)).toEqual(matchup);
    expect(restoreMatchup(JSON.stringify(matchup), heroIds, petIds)).toEqual(matchup);
  });

  it("rejects invalid rune types, abilities, unoccupied positions and duplicates", () => {
    const team = placeHero(emptyTeam(), 0, "a");
    expect(equipRune(team, "absent", { runeId: "80001_5", ability: null })).toBe(team);
    expect(equipRune(team, "a", { runeId: "missing", ability: null })).toBe(team);
    expect(equipRune(team, "a", { runeId: "80001_5", ability: 7 })).toBe(team);
    expect(equipRune(team, "a", { runeId: "80001_4", ability: null })).toBe(team);
    for (const encoded of ["1-99999_5-1", "1-80001_5-7", "1-80001_4-1", "2-80001_5-0", "1-80001_5-1,1-80101_5-0"]) {
      expect(readSharedMatchup(`#setup=4/1-a/-/-/${encoded}/-/-/-/-`, new Set(["a"]), new Set())).toBeNull();
    }
  });

  it("drops stale runes on restore and keeps version 3 artifact links working", () => {
    const restored = restoreMatchup(
      JSON.stringify({
        ally: {
          slots: ["a", "b"],
          runes: {
            a: { runeId: "80001_5", ability: null },
            b: { runeId: "80101_5", ability: 7 },
            absent: { runeId: "80001_5", ability: 1 },
          },
        },
      }),
      new Set(["a", "b"]),
      new Set(),
    );
    expect(restored.ally.runes).toEqual({ a: { runeId: "80001_5", ability: null } });
    expect(readSharedMatchup("#setup=3/1-a/-/1-mythic-03/-/-/-", new Set(["a"]), new Set())?.enemy.artifacts).toEqual({
      a: "mythic-03",
    });
  });
});
