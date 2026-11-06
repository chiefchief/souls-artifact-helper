// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { RuneIcon } from "./RuneIcon";
import { mapHeroRuneToAppearance } from "./runes";

afterEach(cleanup);

it("maps saved rune IDs into named component props", () => {
  expect(mapHeroRuneToAppearance({ runeId: "80001_5", ability: 2 })).toEqual({
    rune: "onslaught",
    ability: "potential",
  });
  expect(mapHeroRuneToAppearance({ runeId: "80101_5", ability: null })).toEqual({
    rune: "defence",
    ability: null,
  });
  expect(mapHeroRuneToAppearance({ runeId: "unknown", ability: null })).toBeNull();
});

it.each([
  [1, "mod"],
  [2, "potential"],
  [3, "reincarnation"],
  [4, "survivalWill"],
  [5, "regenerationOfLife"],
  [6, "grimReapersGrasp"],
])("maps saved ability %i to the programmatic key %s", (id, key) => {
  expect(mapHeroRuneToAppearance({ runeId: "80101_5", ability: id })).toEqual({
    rune: "defence",
    ability: key,
  });
});

it("renders a rune with an optional ability and updates when it is changed or cleared", () => {
  const { container, rerender } = render(<RuneIcon rune="onslaught" />);
  expect(screen.getByRole("img", { name: "Rune of Onslaught · Legendary" })).toBeTruthy();
  expect(container.querySelectorAll("img")).toHaveLength(1);

  rerender(<RuneIcon rune="onslaught" ability="potential" />);
  expect(screen.getByRole("img", { name: "Rune of Onslaught · Legendary · Potential" })).toBeTruthy();
  expect(container.querySelector(".rune-icon__ability")?.getAttribute("src")).toBe("/runes/ability-2.png");

  rerender(<RuneIcon rune="defence" ability="grimReapersGrasp" />);
  expect(screen.getByRole("img", { name: "Rune of Defense · Legendary · Grim Reaper's Grasp" })).toBeTruthy();
  expect(container.querySelector(".rune-icon__ability")?.getAttribute("src")).toBe("/runes/ability-6.png");

  rerender(<RuneIcon rune="defence" ability={null} />);
  expect(container.querySelectorAll("img")).toHaveLength(1);
});
