export const soulsColors = {
  void: "#111522",
  night: "#1d2435",
  dusk: "#343052",
  spirit: "#7ed4ff",
  rune: "#b981ff",
  gold: "#f6c85f",
  ember: "#ff7a45",
  leaf: "#68c58e",
  panel: "#f7f2e8",
  parchment: "#fff8ea",
  ink: "#272033",
  muted: "#776f86",
} as const;

export type SoulsColor = keyof typeof soulsColors;
