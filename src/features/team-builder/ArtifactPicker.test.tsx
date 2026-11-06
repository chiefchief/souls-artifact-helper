// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ArtifactPicker, formationArtifacts } from "./ArtifactPicker";
import { artifactEquipmentRoles, canEquipArtifact } from "../../data/artifactEquipment";
import type { HeroRole } from "../../heroes/types";

afterEach(cleanup);

describe("artifact equipment classes", () => {
  it("classifies every available artifact explicitly", () => {
    expect(Object.keys(artifactEquipmentRoles).sort()).toEqual(formationArtifacts.map((item) => item.id).sort());
    expect(canEquipArtifact("healer", "unknown")).toBe(false);
  });

  it.each<[HeroRole, string]>([
    ["healer", "Harmony"],
    ["tanker", "Paladin Cuirass"],
    ["dealer", "Demonic Beast Fang"],
    ["supporter", "Turbulent Lamp of Wrath"],
  ])("shows only compatible and universal artifacts for %s", (role, specificArtifact) => {
    render(<ArtifactPicker heroName="Hero" heroRole={role} onSelect={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: specificArtifact })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Evidence of Miracle" })).toBeTruthy();
    for (const artifact of formationArtifacts) {
      const button = screen
        .queryAllByRole("button", { name: artifact.name })
        .find((candidate) => candidate.querySelector("img")?.getAttribute("src") === artifact.imageUrl);
      expect(Boolean(button)).toBe(canEquipArtifact(role, artifact.id));
    }
  });

  it("keeps compatibility filtering when searching and selecting a rarity", () => {
    const onSelect = vi.fn();
    render(<ArtifactPicker heroName="Aolmond" heroRole="healer" onSelect={onSelect} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "mythic" }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Paladin" } });
    expect(screen.queryByRole("button", { name: "Paladin Cuirass" })).toBeNull();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Harmony" } });
    fireEvent.click(screen.getByRole("button", { name: "Harmony" }));
    expect(onSelect).toHaveBeenCalledWith("mythic-23");
  });
});
