import { darknessHeroes } from "./darkness/darkness";
import { counterpicksByTargetId } from "./counterpicks";
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
].map((hero) => ({ ...hero, counterpicks: counterpicksByTargetId[hero.id] ?? [] }));

export { darknessHeroes, elfHeroes, hordeHeroes, humanHeroes, lightHeroes, undeadHeroes };

export type {
  Hero,
  HeroAttribute,
  HeroCounterpick,
  HeroId,
  CounterpickRating,
  HeroRace,
  HeroRarity,
  HeroRole,
  HeroSkills,
  Skill,
  SkillTag,
  SkillType,
} from "./types";
