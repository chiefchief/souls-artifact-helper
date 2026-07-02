import { heroImageUrl, type Hero } from "../../types";
export const amanda: Hero = {
  id: "amanda",
  name: "Amanda",
  rarity: "epic",
  race: "undead",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("undead", "amanda"),
  skills: [
    {
      id: "amanda_deaths_scythe",
      type: "active",
      name: "Death's Scythe",
      description:
        "Deal ATK 185% damage to the enemy with the highest ATK and apply a debuff that reduces its ATK by 40% for 2 turn(s).",
      tags: ["reduce-attack"],
    },
    {
      id: "amanda_painful_blow",
      type: "passive",
      name: "Painful Blow",
      description: "ATK of normal attack increases by 40% and removes 1 buff(s) from the enemy.",
      tags: ["remove-enemy-buff"],
    },
    {
      id: "amanda_sacrificed_soul",
      type: "passive",
      name: "Sacrificed Soul",
      description:
        "Upon death (activates even during an enemy's continuous attack), reduce the Energy of all enemies by 50. (once per battle)",
      tags: ["reduce-energy"],
    },
    {
      id: "amanda_soul_collector",
      type: "passive",
      name: "Soul Collector",
      description: "At the start of battle, apply a debuff to all enemies that reduces ATK by 20% for 3 turn(s).",
      tags: ["reduce-attack"],
    },
    {
      id: "amanda_necromancer",
      type: "awaken",
      name: "Necromancer",
      description:
        "At the start of battle and every 3 rounds thereafter, reduce the Energy of the 2 enemies with the highest ATK by 30 and remove all buffs applied to them.",
      tags: ["reduce-attack", "reduce-energy", "remove-enemy-buff"],
    },
    {
      id: "amanda_engraving",
      type: "engraving",
      name: "Amanda's Engraving",
      description:
        "Heal 20% of max HP upon defeating an enemy. Your ATK permanently increases by 20% of the ATK of the enemy defeated.",
      tags: ["execute"],
    },
  ],
};
