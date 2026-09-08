import type { Matchup } from "./state";

type Portrait = { id: string; imageUrl: string };

export async function exportFormationImage(matchup: Matchup, heroes: Portrait[], pets: Portrait[]): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 1200;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image export is unavailable in this browser.");
  const portraits = new Map<string, HTMLImageElement>();
  const used = new Set([...matchup.enemy.slots, ...matchup.ally.slots, matchup.enemy.petId, matchup.ally.petId]);
  await Promise.all(
    [...heroes, ...pets]
      .filter((item) => used.has(item.id))
      .map(async (item) => {
        const img = new Image();
        img.src = item.imageUrl;
        await img.decode();
        portraits.set(item.id, img);
      }),
  );
  const background = context.createLinearGradient(0, 0, 800, 1200);
  background.addColorStop(0, "#242334");
  background.addColorStop(1, "#111522");
  context.fillStyle = background;
  context.fillRect(0, 0, 800, 1200);
  context.textAlign = "center";
  context.fillStyle = "#f6c85f";
  context.font = "bold 22px system-ui";
  context.fillText("SOULS · TEAM BUILDER", 400, 50);

  function slot(x: number, y: number, id: string | null, color: string, pet = false) {
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
  }

  for (const side of ["enemy", "ally"] as const) {
    const team = matchup[side];
    const color = side === "enemy" ? "#ee9c88" : "#7ed4ff";
    const top = side === "enemy" ? 125 : 690;
    context.fillStyle = color;
    context.font = "bold 24px system-ui";
    context.fillText(side === "enemy" ? "Enemy team" : "Allied team", 400, side === "enemy" ? 100 : 1130);
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
      const start = 400 - (row.length * 112 - 8) / 2;
      row.forEach((index, column) => slot(start + column * 112, top + rowIndex * 132, team.slots[index], color));
      if (rowIndex === 1) slot(side === "enemy" ? start + 224 : start - 112, top + 132, team.petId, color, true);
    });
  }
  context.strokeStyle = "#f6c85f55";
  context.beginPath();
  context.moveTo(120, 600);
  context.lineTo(680, 600);
  context.stroke();
  context.fillStyle = "#f6c85f";
  context.font = "bold 18px system-ui";
  context.fillText("VS", 400, 583);
  context.fillStyle = "#fff8ea88";
  context.font = "14px system-ui";
  context.fillText("SOULS Artifacts Helper", 400, 1180);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create image."))), "image/png"),
  );
}
