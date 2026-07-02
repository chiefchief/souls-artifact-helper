export type SkillType = "active" | "passive" | "awaken" | "engraving" | "exclusive-equipment";

export type HeroRarity = "epic" | "rare" | "normal";
export type HeroRace = "human" | "horde" | "elf" | "undead" | "light" | "darkness";
export type HeroRole = "tanker" | "dealer" | "supporter" | "healer";
export type HeroAttribute = "strength" | "agility" | "intelligence";
export type SkillStat =
  | "atk"
  | "hp"
  | "speed"
  | "cc_res"
  | "crit_rate"
  | "crit_def"
  | "pen"
  | "acc"
  | "mres"
  | "pres"
  | "dodge_rate"
  | "lifesteal_rate"
  | "def"
  | "accuracy"
  | "damage_reduction";

export type SkillTag =
  | "absorb-energy"
  | "anti-shield"
  | "buff-block"
  | "cc"
  | "counter-attack"
  | "apply-dot"
  | "damage-cap"
  | "damage-reduction"
  | "reflect-damage"
  | "execute"
  | "gain-energy"
  | "give-energy"
  | "heal-allies"
  | "heal-self"
  | "healing-over-time"
  | "increase-energy-gain"
  | "increase-allies-attack"
  | "increase-allies-defense"
  | "increase-allies-lifesteal"
  | "increase-allies-speed"
  | "increase-cc-resistance"
  | "increase-crit-damage"
  | "increase-crit-rate"
  | "increase-crit-resistance"
  | "reduce-crit-resistance"
  | "increase-damage-taken"
  | "increase-healing-received"
  | "join-attack"
  | "increase-self-accuracy"
  | "increase-allies-accuracy"
  | "increase-self-attack"
  | "increase-self-crit-damage"
  | "increase-self-crit-rate"
  | "increase-self-defense"
  | "increase-self-dodge"
  | "increase-self-lifesteal"
  | "increase-self-penetration"
  | "increase-self-speed"
  | "prevent-revive"
  | "repeat-attack"
  | "reduce-attack"
  | "reduce-cc-resistance"
  | "reduce-crit-damage"
  | "reduce-crit-rate"
  | "reduce-defense"
  | "reduce-pres"
  | "reduce-dot-damage"
  | "reduce-enemy-speed"
  | "reduce-energy"
  | "reduce-energy-gain"
  | "reduce-healing-received"
  | "remove-ally-debuff"
  | "remove-self-debuff"
  | "remove-cc"
  | "remove-dot"
  | "remove-enemy-buff"
  | "revive-ally"
  | "revive-self"
  | "shield"
  | "silence"
  | "sleep"
  | "survive"
  | "taunt";

type StatBonus = {
  stat: SkillStat;
  value: number;
};

export type Skill = {
  id: string;
  type: SkillType;
  name: string;
  description: string;
  statBonus?: StatBonus[];
  tags: SkillTag[];
};

export type HeroSkills = [
  Skill & { type: "active" },
  Skill & { type: "passive" },
  Skill & { type: "passive" },
  Skill & { type: "passive" },
  Skill & { type: "awaken" },
  Skill & { type: "engraving" },
  (Skill & { type: "exclusive-equipment" })?,
];

export type Hero = {
  id: string;
  name: string;
  rarity: HeroRarity;
  race: HeroRace;
  role: HeroRole;
  attribute: HeroAttribute | null;
  imageUrl: string;
  skills: HeroSkills | [];
};

export function heroImageUrl(race: HeroRace, heroId: string): string {
  const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

  return `${baseUrl}heroes/${race}/${heroId}/image.png`;
}
