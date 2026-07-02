import { heroImageUrl, type Hero } from "../../types";

export const milia: Hero = {
  id: "milia",
  name: "Milia",
  rarity: "epic",
  race: "human",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("human", "milia"),
  skills: [
    {
      id: "milia_final_strike",
      type: "active",
      name: "Final Strike",
      description:
        "Deal ATK 230% damage to the enemy with the lowest HP. When an active skill lands a critical hit, gain a buff that increases Crit Damage by 20% for 3 turn(s).",
      tags: [],
    },
    {
      id: "milia_precise_shot",
      type: "passive",
      name: "Precise Shot",
      description: "Normal attack deals ATK 145% damage to the enemy with the lowest HP.",
      tags: [],
    },
    {
      id: "milia_mortal_wound",
      type: "passive",
      name: "Mortal Wound",
      description: "When landing a critical hit, heal yourself 40% of the damage dealt.",
      statBonus: [{ stat: "crit_rate", value: 11 }],
      tags: ["heal-self"],
    },
    {
      id: "milia_shrine_of_god",
      type: "passive",
      name: "Shrine of God",
      description: "Crit Rate increases by 10% for each adjacent surviving ally.",
      tags: [],
    },
    {
      id: "milia_unstoppable_force",
      type: "awaken",
      name: "Unstoppable Force",
      description:
        "If an enemy is killed with an active skill, the active skill is reused. This repeated attack deals 17% reduced damage.",
      tags: ["execute", "repeat-attack"],
    },
    {
      id: "milia_engraving",
      type: "engraving",
      name: "Milia's Engraving",
      description:
        "Normal attacks have a 40% chance of triggering a re-attack. The ATK of this attack will be reduced by 20%. (Maximum of 3 times per battle)",
      tags: ["repeat-attack", "reduce-attack"],
    },
    {
      id: "milia_radiant_bow",
      type: "exclusive-equipment",
      name: "Radiant Bow",
      description:
        "Each time you attack an enemy, Penetration increases by 5%. (Up to 10 times)\nUpon defeating an enemy, absorbs 12% of that enemy's ATK.",
      statBonus: [{ stat: "pen", value: 30 }],
      tags: ["execute", "increase-self-penetration"],
    },
  ],
};
