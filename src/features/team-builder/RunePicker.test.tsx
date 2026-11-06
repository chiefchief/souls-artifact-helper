// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RunePicker } from "./RunePicker";

afterEach(cleanup);

describe("rune selection", () => {
  it("saves a rune without requiring a special ability", () => {
    const onSave = vi.fn();
    render(<RunePicker heroName="Carmen" onSave={onSave} onClose={() => {}} />);
    expect(screen.queryByLabelText("Rune rarity")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Rune of Onslaught · Legendary" }));
    fireEvent.click(screen.getByRole("button", { name: "Save rune" }));
    expect(onSave).toHaveBeenCalledWith({ runeId: "80001_5", ability: null });
  });

  it("removes an equipped rune with its ability", () => {
    const onSave = vi.fn();
    render(
      <RunePicker heroName="Carmen" value={{ runeId: "80101_5", ability: 2 }} onSave={onSave} onClose={() => {}} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove rune" }));
    expect(onSave).toHaveBeenCalledExactlyOnceWith(null);
  });

  it("selects named abilities and can clear them", () => {
    const onSave = vi.fn();
    render(
      <RunePicker heroName="Carmen" value={{ runeId: "80101_5", ability: 2 }} onSave={onSave} onClose={() => {}} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Grim Reaper's Grasp" }));
    fireEvent.click(screen.getByRole("button", { name: "Save rune" }));
    expect(onSave).toHaveBeenLastCalledWith({ runeId: "80101_5", ability: 6 });
    fireEvent.click(screen.getByRole("button", { name: "No special ability" }));
    fireEvent.click(screen.getByRole("button", { name: "Save rune" }));
    expect(onSave).toHaveBeenLastCalledWith({ runeId: "80101_5", ability: null });
  });
});
