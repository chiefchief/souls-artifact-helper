export type SkillType = "active" | "passive" | "awaken" | "engraving" | "exclusive-equipment";

export type HeroRarity = "epic" | "rare" | "normal";
export type HeroRace = "human" | "horde" | "elf" | "undead" | "light" | "darkness";
export type HeroRole = "tanker" | "dealer" | "supporter" | "healer";
export type HeroAttribute = "strength" | "agility" | "intelligence";
export type HeroId =
  | "abala"
  | "adora"
  | "akmon"
  | "amanda"
  | "aolmond"
  | "aruru"
  | "ash"
  | "babu"
  | "bahzam"
  | "bella"
  | "benzel"
  | "calix"
  | "carmen"
  | "chiron"
  | "coco"
  | "dextor"
  | "dmitri"
  | "dolucos"
  | "elara"
  | "feruki"
  | "fiona"
  | "fleta"
  | "galan"
  | "harfa"
  | "idina"
  | "jack"
  | "kaion"
  | "karim"
  | "ken"
  | "kyle"
  | "lagou"
  | "lena"
  | "leovalt"
  | "liandra"
  | "lilith"
  | "louveti"
  | "lulu"
  | "lumen"
  | "lupico"
  | "melantha"
  | "milia"
  | "morra"
  | "muerte"
  | "naru"
  | "nebula"
  | "nevir"
  | "nox"
  | "nuel"
  | "odelia"
  | "olga"
  | "oneiric"
  | "paopao"
  | "paru"
  | "rael"
  | "rakan"
  | "richelle"
  | "ripper"
  | "roze"
  | "sander"
  | "scarlet"
  | "sekhrus"
  | "serena"
  | "sol"
  | "solina"
  | "tania"
  | "taros"
  | "telfer"
  | "ulion"
  | "vescura"
  | "void"
  | "zagrako"
  | "zeke"
  | "zenon";
export type CounterpickRating = 1 | 2 | 3 | 4 | 5;
export type HeroCounterpick = {
  heroId: HeroId;
  rating: CounterpickRating;
};
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
  | "ignore-damage-cap"
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
  | "taunt"
  | "percent-damage";

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
  id: HeroId;
  name: string;
  rarity: HeroRarity;
  race: HeroRace;
  role: HeroRole;
  attribute: HeroAttribute | null;
  imageUrl: string;
  skills: HeroSkills | [];
  /** Heroes that are useful answers to this hero. Ratings are an editable 1–5 reference scale. */
  counterpicks?: HeroCounterpick[];
};

export function heroImageUrl(race: HeroRace, heroId: HeroId): string {
  const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

  return `${baseUrl}heroes/${race}/${heroId}/image.png`;
}
