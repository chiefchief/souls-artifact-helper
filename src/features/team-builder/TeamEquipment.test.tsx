// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { TeamEquipment } from "./TeamEquipment";
import { emptyTeam, type Team } from "./state";
import { formationArtifacts } from "./ArtifactPicker";

afterEach(cleanup);

it("keeps rows in position order and opens equipment for the correct position", () => {
  const team: Team = {
    ...emptyTeam(),
    slots: [null, "carmen", null, "lulu", null, null, null, null],
    runes: { carmen: { runeId: "80101_5", ability: 2 } },
    artifacts: { carmen: formationArtifacts[0].id },
  };
  const onHero = vi.fn(),
    onRune = vi.fn(),
    onArtifact = vi.fn();
  const { container, rerender } = render(
    <TeamEquipment
      team={team}
      teamName="Enemy"
      selectedSlot={1}
      onHero={onHero}
      onRune={onRune}
      onArtifact={onArtifact}
    />,
  );
  const rows = container.querySelectorAll(".equipment-row");
  expect(rows).toHaveLength(2);
  expect(rows[0].getAttribute("data-selected")).toBe("true");
  const buttons = within(rows[0] as HTMLElement).getAllByRole("button");
  expect(buttons[0].querySelector("img")?.getAttribute("src")).toBe("/heroes/undead/carmen/face.png");
  expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
    "Select Carmen at Enemy position 2",
    "Change rune for Carmen",
    `Change ${formationArtifacts[0].name} for Carmen`,
  ]);
  buttons.forEach((button) => fireEvent.click(button));
  expect(onHero).toHaveBeenCalledWith(1);
  expect(onRune).toHaveBeenCalledWith(1);
  expect(onArtifact).toHaveBeenCalledWith(1);
  expect(screen.getByRole("img", { name: "Rune of Defense · Legendary · Potential" })).toBeTruthy();
  fireEvent.click(within(rows[1] as HTMLElement).getByRole("button", { name: "Add rune for LuLu" }));
  expect(onRune).toHaveBeenLastCalledWith(3);
  rerender(
    <TeamEquipment
      team={{ ...team, runes: {}, artifacts: {} }}
      teamName="Enemy"
      selectedSlot={1}
      onHero={onHero}
      onRune={onRune}
      onArtifact={onArtifact}
    />,
  );
  expect(screen.getByRole("button", { name: "Add rune for Carmen" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Add artifact for Carmen" })).toBeTruthy();
});
