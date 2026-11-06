import type { Matchup } from "./state";
import { artifactImageCollections } from "../../data/artifactImageCollections";
import { runes, runeAbilities, RUNE_ABILITY_WIDTH_RATIO, RUNE_ABILITY_OVERHANG_RATIO } from "./runes";

type Portrait = { id: string; imageUrl: string };

export async function exportFormationImage(matchup: Matchup, heroes: Portrait[], pets: Portrait[]): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const layoutSize = 800;
  const exportSize = 2048;
  const exportScale = exportSize / layoutSize;
  canvas.width = exportSize;
  canvas.height = exportSize;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image export is unavailable in this browser.");
  context.scale(exportScale, exportScale);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  const portraits = new Map<string, HTMLImageElement>();
  const used = new Set([...matchup.enemy.slots, ...matchup.ally.slots, matchup.enemy.petId, matchup.ally.petId]);
  for (const team of [matchup.enemy, matchup.ally]) {
    for (const id of Object.values(team.artifacts ?? {})) used.add(id);
    for (const rune of Object.values(team.runes ?? {})) {
      used.add(rune.runeId);
      if (rune.ability) used.add(`rune-ability-${rune.ability}`);
    }
  }
  await Promise.all(
    [
      ...heroes,
      ...pets,
      ...artifactImageCollections.flatMap((collection) => collection.images),
      ...runes,
      ...runeAbilities.map((ability) => ({ ...ability, id: `rune-ability-${ability.id}` })),
    ]
      .filter((item) => used.has(item.id))
      .map(async (item) => {
        const img = new Image();
        img.src = item.imageUrl;
        await img.decode();
        portraits.set(item.id, img);
      }),
  );
  const background = context.createLinearGradient(0, 0, layoutSize, layoutSize);
  background.addColorStop(0, "#242334");
  background.addColorStop(1, "#111522");
  context.fillStyle = background;
  context.fillRect(0, 0, layoutSize, layoutSize);
  context.textAlign = "center";

  function slot(x: number, y: number, id: string | null, color: string, pet = false) {
    context!.save();
    if (pet) {
      context!.translate(x + 52, y + 60.5);
      context!.scale(0.7, 0.7);
      context!.translate(-(x + 52), -(y + 60.5));
    }
    context!.save();
    context!.beginPath();
    context!.roundRect(x, y, 104, 121, 10);
    context!.clip();
    context!.fillStyle = "#1b2030";
    context!.fillRect(x, y, 104, 121);
    const img = id ? portraits.get(id) : null;
    if (img) {
      const scale = Math.max(104 / img.naturalWidth, 121 / img.naturalHeight) * 1.12;
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      context!.drawImage(img, x + (104 - width) / 2, y + (121 - height) / 2, width, height);
    } else {
      context!.fillStyle = color;
      context!.font = pet ? "14px system-ui" : "28px system-ui";
      context!.fillText(pet ? "PET" : "+", x + 52, y + 69);
    }
    context!.restore();
    context!.strokeStyle = color;
    context!.lineWidth = 2;
    context!.beginPath();
    context!.roundRect(x, y, 104, 121, 10);
    context!.stroke();
    context!.restore();
  }

  for (const side of ["enemy", "ally"] as const) {
    const team = matchup[side];
    const color = side === "enemy" ? "#ee9c88" : "#7ed4ff";
    context.save();
    context.translate(40, side === "enemy" ? 20 : 430);
    context.scale(0.9, 0.9);
    const rows =
      side === "enemy"
        ? [
            [5, 6, 7],
            [3, 4],
            [0, 1, 2],
          ]
        : [
            [0, 1, 2],
            [3, 4],
            [5, 6, 7],
          ];
    rows.forEach((row, rowIndex) => {
      const start = 400 - (row.length * 128 - 24) / 2;
      row.forEach((index, column) => {
        const x = start + column * 128;
        const y = rowIndex * 132;
        const heroId = team.slots[index];
        slot(x, y, heroId, color);
        const artifactId = heroId ? team.artifacts?.[heroId] : null;
        const artifact = artifactId ? portraits.get(artifactId) : null;
        if (artifact) {
          context.save();
          context.beginPath();
          context.roundRect(x + 59, y + 76, 48, 48, 5);
          context.fillStyle = "#111522";
          context.fill();
          context.clip();
          const scale = Math.min(48 / artifact.naturalWidth, 48 / artifact.naturalHeight);
          const width = artifact.naturalWidth * scale;
          const height = artifact.naturalHeight * scale;
          context.drawImage(artifact, x + 59 + (48 - width) / 2, y + 76 + (48 - height) / 2, width, height);
          context.restore();
          context.strokeStyle = "#f6c85f88";
          context.lineWidth = 1;
          context.stroke();
        }
        const heroRune = heroId ? team.runes?.[heroId] : null;
        const rune = heroRune ? portraits.get(heroRune.runeId) : null;
        if (rune) {
          const scale = Math.min(48 / rune.naturalWidth, 48 / rune.naturalHeight);
          const width = rune.naturalWidth * scale;
          const height = rune.naturalHeight * scale;
          context.drawImage(rune, x - 3 + (48 - width) / 2, y + 76 + (48 - height) / 2, width, height);
          const ability = heroRune?.ability ? portraits.get(`rune-ability-${heroRune.ability}`) : null;
          if (ability) {
            const runeSize = 48;
            const abilityWidth = runeSize * RUNE_ABILITY_WIDTH_RATIO;
            const abilityHeight = (abilityWidth * ability.naturalHeight) / ability.naturalWidth;
            context.drawImage(
              ability,
              x - 3 - runeSize * RUNE_ABILITY_OVERHANG_RATIO,
              y + 76 + runeSize * (1 + RUNE_ABILITY_OVERHANG_RATIO) - abilityHeight,
              abilityWidth,
              abilityHeight,
            );
          }
        }
      });
      if (rowIndex === 1) slot(side === "enemy" ? start + 256 : start - 128, 132, team.petId, color, true);
    });
    context.restore();
  }
  for (const [start, end] of [
    [70, 366],
    [434, 730],
  ]) {
    const gradient = context.createLinearGradient(start, 400, end, 400);
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(0.5, "#f6c85f55");
    gradient.addColorStop(1, "transparent");
    context.strokeStyle = gradient;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(start, 400);
    context.lineTo(end, 400);
    context.stroke();
  }
  context.save();
  context.translate(388, 388);
  context.strokeStyle = "#f6c85f99";
  context.lineWidth = 2;
  context.lineCap = "round";
  context.lineJoin = "round";
  // Same Lucide Swords outline used by the Team Builder divider.
  context.stroke(
    new Path2D(
      "M14.5 17.5 3 6 3 3 6 3 17.5 14.5 M13 19 19 13 M16 16 20 20 M19 21 21 19 " +
        "M14.5 6.5 18 3 21 3 21 6 17.5 9.5 M5 14 9 18 M7 17 4 20 M3 19 5 21",
    ),
  );
  context.restore();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create image."))), "image/png"),
  );
}
