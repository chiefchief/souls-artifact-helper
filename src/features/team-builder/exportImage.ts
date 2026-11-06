import { heroFaceImageUrl } from "../../heroes/faceImages";
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
  const facePortraits = heroes
    .filter((hero) => used.has(hero.id))
    .map((hero) => ({
      id: `hero-face-${hero.id}`,
      imageUrl: heroFaceImageUrl(hero),
    }));
  for (const face of facePortraits) used.add(face.id);
  await Promise.all(
    [
      ...heroes,
      ...facePortraits,
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

  const formationScale = 0.92;
  const formationHeight = (2 * 128 + 121) * formationScale;
  const dividerY = layoutSize / 2;
  const dividerGap = 24;
  for (const side of ["enemy", "ally"] as const) {
    const team = matchup[side];
    const color = side === "enemy" ? "#ee9c88" : "#7ed4ff";
    context.save();
    const top = side === "enemy" ? dividerY - dividerGap - formationHeight : dividerY + dividerGap;
    context.translate(290 - 400 * formationScale, top);
    context.scale(formationScale, formationScale);
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
      const start = 400 - (row.length * 116 - 12) / 2;
      row.forEach((index, column) => {
        const x = start + column * 116;
        const y = rowIndex * 128;
        const heroId = team.slots[index];
        slot(x, y, heroId, color);
      });
      if (rowIndex === 1) slot(side === "enemy" ? start + 232 : start - 116, 128, team.petId, color, true);
    });
    context.restore();
    const equipmentScale = 1.06;
    const equipmentHeight = Math.max(0, team.slots.filter(Boolean).length - 1) * 60 + 64;
    // Center the compact list beside its formation without column headings.
    context.save();
    context.translate(566, top + (formationHeight - equipmentHeight * equipmentScale) / 2);
    context.scale(equipmentScale, equipmentScale);
    context.translate(-540, 0);
    let equipmentRow = 0;
    team.slots.forEach((heroId) => {
      if (!heroId) return;
      const y = equipmentRow++ * 60;
      const face = portraits.get(`hero-face-${heroId}`);
      context.save();
      context.beginPath();
      context.roundRect(540, y + 4.25, 52, 52, 5);
      context.clip();
      if (face) context.drawImage(face, 540, y + 4.25, 52, 52);
      context.restore();
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.stroke();
      const equipmentImage = (id: string | null | undefined, x: number, hexagon = false) => {
        const image = id ? portraits.get(id) : null;
        if (!image) {
          if (hexagon) {
            context.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3 - Math.PI / 2;
              const px = x + 26 + Math.cos(angle) * 25;
              const py = y + 30.25 + Math.sin(angle) * 25;
              if (i === 0) context.moveTo(px, py);
              else context.lineTo(px, py);
            }
            context.closePath();
            context.strokeStyle = "#b981ff88";
            context.lineWidth = 1;
            context.stroke();
          }
          context.fillStyle = "#fff8ea55";
          context.font = "20px system-ui";
          context.fillText("+", x + 26, y + 34);
          return;
        }
        const scale = Math.min(52 / image.naturalWidth, 52 / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        context.drawImage(image, x + (52 - width) / 2, y + (60.5 - height) / 2, width, height);
      };
      const heroRune = team.runes?.[heroId];
      equipmentImage(heroRune?.runeId, 606, true);
      const ability = heroRune?.ability ? portraits.get(`rune-ability-${heroRune.ability}`) : null;
      if (ability) {
        const size = 52;
        const width = size * RUNE_ABILITY_WIDTH_RATIO;
        const height = (width * ability.naturalHeight) / ability.naturalWidth;
        context.drawImage(
          ability,
          606 - size * RUNE_ABILITY_OVERHANG_RATIO,
          y + (60.5 - size) / 2 + size * (1 + RUNE_ABILITY_OVERHANG_RATIO) - height,
          width,
          height,
        );
      }
      equipmentImage(team.artifacts?.[heroId], 672);
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
