import { heroImageUrl, type Hero } from "../../types";
export const paru: Hero = {
  id: "paru",
  name: "Paru",
  rarity: "epic",
  race: "horde",
  role: "supporter",
  attribute: "agility",
  imageUrl: heroImageUrl("horde", "paru"),
  skills: [
    {
      id: "paru_cakram",
      type: "active",
      name: "Cakram",
      description:
        "Deal ATK 155% damage to all enemies in the front row, and apply a buff to yourself and all allies in the same row, increasing Crit Rate by 30% for 2 turn(s).",
      tags: ["increase-crit-rate", "increase-self-crit-rate"],
    },
    {
      id: "paru_diffusion_of_energy",
      type: "passive",
      name: "Diffusion of Energy",
      description:
        "All allies in the same row, including yourself, can gain additional 30 Energy when deals a critical hit.",
      tags: ["gain-energy"],
    },
    {
      id: "paru_sharpness",
      type: "passive",
      name: "Sharpness",
      description:
        "Active Skill attack removes 2 buff(s) from the target. When removing buffs, heal yourself by 20% of max HP. (once per round)",
      tags: ["remove-enemy-buff", "heal-self"],
    },
    {
      id: "paru_foxs_instinct",
      type: "passive",
      name: "Fox's Instinct",
      description:
        "Whenever the number of critical hits from all allies in the same row, including yourself, reaches 4, Paru gains a Damage Immunity Shield that lasts for 1 turn.",
      tags: ["shield"],
    },
    {
      id: "paru_wily_fox",
      type: "awaken",
      name: "Wily Fox",
      description:
        "Upon death, remove all Shields from all enemies. Additionally, apply a buff to allies, increasing their Crit Rate and Crit Damage by 38% for 2 turn(s). (once per battle)",
      tags: ["increase-crit-rate", "increase-crit-damage", "anti-shield"],
    },
    {
      id: "paru_engraving",
      type: "engraving",
      name: "Paru's Engraving",
      description:
        "Increase Crit Resistance of all allies in the same row including yourself by 40% and increase Crit DEF by 35%.",
      tags: ["increase-crit-resistance"],
    },
  ],
};
