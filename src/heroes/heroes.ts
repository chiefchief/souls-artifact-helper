import { darknessHeroes } from "./darkness/darkness";
import { elfHeroes } from "./elf/elf";
import { hordeHeroes } from "./horde/horde";
import { humanHeroes } from "./human/human";
import { lightHeroes } from "./light/light";
import { undeadHeroes } from "./undead/undead";

export const heroes = [
  ...humanHeroes,
  ...hordeHeroes,
  ...elfHeroes,
  ...undeadHeroes,
  ...lightHeroes,
  ...darknessHeroes,
];

export { darknessHeroes, elfHeroes, hordeHeroes, humanHeroes, lightHeroes, undeadHeroes };

export type {
  Hero,
  HeroAttribute,
  HeroRace,
  HeroRarity,
  HeroRole,
  HeroSkills,
  Skill,
  SkillTag,
  SkillType,
} from "./types";
