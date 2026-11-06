export const RUNE_ABILITY_WIDTH_RATIO = 0.4;
export const RUNE_ABILITY_OVERHANG_RATIO = 0.06;

const runeDefinitions = [
  { type: "onslaught", name: "Rune of Onslaught", id: "80001_5" },
  { type: "defence", name: "Rune of Defense", id: "80101_5" },
  { type: "life", name: "Rune of Life", id: "80201_5" },
  { type: "fatality", name: "Rune of Fatality", id: "80301_5" },
  { type: "protection", name: "Rune of Protection", id: "80401_5" },
  { type: "iron-wall", name: "Rune of the Iron Wall", id: "80501_5" },
  { type: "penetration", name: "Rune of Penetration", id: "80601_5" },
  { type: "dodging", name: "Rune of Dodging", id: "80701_5" },
  { type: "accuracy", name: "Rune of Accuracy", id: "80801_5" },
  { type: "resistance", name: "Rune of Resistance", id: "80901_5" },
  { type: "steel", name: "Rune of Steel", id: "81001_5" },
  { type: "peace", name: "Rune of Peace", id: "81101_5" },
] as const;
export type RuneType = (typeof runeDefinitions)[number]["type"];
export const runes = runeDefinitions.map((rune) => ({
  id: rune.id,
  type: rune.type,
  name: `${rune.name} · Legendary`,
  typeName: rune.name,
  imageUrl: `${import.meta.env.BASE_URL}runes/${rune.id}.png`,
}));
export const runeById = new Map<string, (typeof runes)[number]>(runes.map((rune) => [rune.id, rune]));
export const runeByType = new Map(runes.map((rune) => [rune.type, rune]));
const abilityOptions = [
  {
    key: "mod",
    name: "Might of Desperation",
    description: "When using an active skill, there is a 20% chance to reuse the skill.",
  },
  {
    key: "potential",
    name: "Potential",
    description: "At the start of each round, there is a 40% chance to gain 50 Energy.",
  },
  {
    key: "reincarnation",
    name: "Reincarnation",
    description: "Upon death, there is a 20% chance to revive at the start of next round with 100% HP.",
  },
  {
    key: "survivalWill",
    name: "Survival Will",
    description: "Increases ATK, DEF, and Dodge Rate by 25% when HP is below 70%.",
  },
  {
    key: "regenerationOfLife",
    name: "Regeneration of Life",
    description: "Recovers 30% of max HP at the start of each round until round 5.",
  },
  { key: "grimReapersGrasp", name: "Grim Reaper's Grasp", description: "Increases the damage of DoT attacks by 30%." },
] as const;
export type RuneAbility = (typeof abilityOptions)[number]["key"];
export const runeAbilities = abilityOptions.map((option, index) => ({
  id: index + 1,
  ...option,
  imageUrl: `${import.meta.env.BASE_URL}runes/ability-${index + 1}.png`,
}));
export const runeAbilityById = new Map(runeAbilities.map((ability) => [ability.id, ability]));
export const runeAbilityByKey = new Map(runeAbilities.map((ability) => [ability.key, ability]));
export type HeroRune = { runeId: string; ability: number | null };
export type RuneAppearance = { rune: RuneType; ability?: RuneAbility | null };

export function mapHeroRuneToAppearance(value: HeroRune): RuneAppearance | null {
  const rune = runeById.get(value.runeId);
  if (!rune) return null;
  return { rune: rune.type, ability: value.ability === null ? null : runeAbilityById.get(value.ability)?.key };
}

export function isHeroRune(value: unknown): value is HeroRune {
  if (!value || typeof value !== "object") return false;
  const rune = value as Partial<HeroRune>;
  return (
    typeof rune.runeId === "string" &&
    runeById.has(rune.runeId) &&
    (rune.ability === null || runeAbilities.some((ability) => ability.id === rune.ability))
  );
}
