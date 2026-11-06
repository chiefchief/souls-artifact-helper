// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { TeamBuilder } from "./TeamBuilder";
import { emptyMatchup } from "./state";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

it("keeps the current picker while an equipment button is held and switches only on click", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const matchup = emptyMatchup();
  matchup.ally.slots[0] = "carmen";
  localStorage.setItem("souls-team-builder-v1", JSON.stringify(matchup));
  render(<TeamBuilder />);
  const equipment = within(screen.getByRole("group", { name: "Allied equipment" }));
  const artifact = equipment.getByRole("button", { name: "Add artifact for Carmen" });
  const rune = equipment.getByRole("button", { name: "Add rune for Carmen" });
  fireEvent.click(artifact);
  expect(screen.getByRole("heading", { name: "Choose artifact" })).toBeTruthy();
  fireEvent.pointerDown(rune, { button: 0 });
  expect(screen.getByRole("heading", { name: "Choose artifact" })).toBeTruthy();
  fireEvent.pointerUp(rune, { button: 0 });
  fireEvent.click(rune);
  expect(screen.getByRole("heading", { name: "Choose rune" })).toBeTruthy();
  fireEvent.pointerDown(artifact, { button: 0 });
  expect(screen.getByRole("heading", { name: "Choose rune" })).toBeTruthy();
  fireEvent.pointerUp(artifact, { button: 0 });
  fireEvent.click(artifact);
  expect(screen.getByRole("heading", { name: "Choose artifact" })).toBeTruthy();
  fireEvent.pointerDown(document.body);
  expect(screen.getByRole("heading", { name: "Choose a position" })).toBeTruthy();
});
