import { heroImageUrl, type Hero } from "../../types";
export const jack: Hero = {
  id: "jack",
  name: "Jack",
  rarity: "epic",
  race: "horde",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("horde", "jack"),
  skills: [
    {
      id: "jack_diseases_stinger",
      type: "active",
      name: "Disease's Stinger",
      description:
        "Deal damage equal to 180% of Attack to the closest enemy in the back row and apply 2 stacks of Tetanus. Tetanus inflicts continuous damage equal to 55% of Attack for 3 turns and reduces the enemy's Attack by 13% and Critical Rate by 17%.",
      tags: ["apply-dot", "reduce-attack", "reduce-crit-rate"],
    },
    {
      id: "jack_rusted_sword",
      type: "passive",
      name: "Rusted Sword",
      description: "Deal damage equal to 145% of Attack to the closest enemy in the back row.",
      tags: [],
    },
    {
      id: "jack_forbidden_drug",
      type: "passive",
      name: "Forbidden Drug",
      description:
        "The lower the HP, the higher the Dodge rate. (Dodge rate increases by 0.6% for every 1% of HP lost)\nRecover HP by 75% of the damage dealt to the enemy with Tetanus.",
      statBonus: [
        { stat: "dodge_rate", value: 30 },
        { stat: "crit_def", value: 30 },
      ],
      tags: ["increase-self-dodge", "heal-self"],
    },
    {
      id: "jack_madness_hyena",
      type: "passive",
      name: "Madness Hyena",
      description:
        "Removes 1 buffs from the enemy with normal and active attacks. Gaining a buff that increases Attack by 12% for 2 turns upon removal.",
      tags: ["remove-enemy-buff", "increase-self-attack"],
    },
    {
      id: "jack_infection",
      type: "awaken",
      name: "Infection",
      description:
        "When an enemy with Tetanus dies, it spreads to all adjacent enemies, dealing damage equal to 80% of Attack for 3 turns.",
      tags: ["apply-dot"],
    },
    {
      id: "jack_engraving",
      type: "engraving",
      name: "Jack's Engraving",
      description: "When an ally attacks, there is a 30% chance to attack together, dealing 145% of ATK as damage.",
      tags: ["join-attack"],
    },
    {
      id: "jack_jacks_surgical_tools",
      type: "exclusive-equipment",
      name: "Jack's Surgical Tools",
      description:
        "Inflicts 1 stack of Tetanus on the enemy when performing normal attacks or joint attacks. Jack's active skill always hits, and he always dodges attacks from enemies afflicted with Tetanus.",
      tags: ["apply-dot", "increase-self-dodge"],
    },
  ],
};
