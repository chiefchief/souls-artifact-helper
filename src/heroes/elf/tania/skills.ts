import { heroImageUrl, type Hero } from "../../types";
export const tania: Hero = {
  id: "tania",
  name: "Tania",
  rarity: "epic",
  race: "elf",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("elf", "tania"),
  skills: [
    {
      id: "tania_thorned_arrow",
      type: "active",
      name: "Thorned Arrow",
      description: "Deal ATK 180% damage to all enemies in the front row.",
      tags: [],
    },
    {
      id: "tania_guard_shot",
      type: "passive",
      name: "Guard Shot",
      description:
        "ATK of normal attack increases by 35%, and normal attack applies a Crit Weaken debuff to the enemy, increasing the chance of being critically hit by 20% for 2 turn(s).",
      statBonus: [
        { stat: "pen", value: 20 },
        { stat: "acc", value: 30 },
      ],
      tags: [],
    },
    {
      id: "tania_ranged_specialization",
      type: "passive",
      name: "Ranged Specialization",
      description: "The further you are to the enemy, the higher ATK increases. (max 21%)",
      tags: [],
    },
    {
      id: "tania_nature_protection",
      type: "passive",
      name: "Nature Protection",
      description: "At the start of every 2 round(s), gain a buff that increases Crit Rate by 30% for 2 turn(s).",
      statBonus: [{ stat: "hp", value: 12 }],
      tags: ["increase-self-crit-rate"],
    },
    {
      id: "tania_full_power",
      type: "awaken",
      name: "Full Power",
      description:
        "Crit Damage increases by 20% whenever any attack lands as a critical hit. (max 3 stacks. If no critical hits occur, it will reset)",
      statBonus: [{ stat: "crit_rate", value: 20 }],
      tags: ["increase-self-crit-damage"],
    },
    {
      id: "tania_engraving",
      type: "engraving",
      name: "Tania's Engraving",
      description:
        "Recover HP by 25% of total damage dealt to enemy through Critical Strike. If HP is full, the extra Healing amount will be converted to a Shield that lasts for 1 turn.",
      tags: ["heal-self", "shield"],
    },
  ],
};
