import { heroImageUrl, type Hero } from "../../types";
export const telfer: Hero = {
  id: "telfer",
  name: "Telfer",
  rarity: "epic",
  race: "horde",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("horde", "telfer"),
  skills: [
    {
      id: "telfer_hemorrhage",
      type: "active",
      name: "Hemorrhage",
      description: "Deal ATK 195% damage to 1 enemy and inflict Bleeding, dealing ATK 110% DoT for 3 turn(s).",
      tags: ["apply-dot"],
    },
    {
      id: "telfer_sharp_claw",
      type: "passive",
      name: "Sharp Claw",
      description: "ATK of normal attack increases by 45%.",
      statBonus: [
        { stat: "pen", value: 13 },
        { stat: "dodge_rate", value: 7 },
      ],
      tags: [],
    },
    {
      id: "telfer_terrifying_laugh",
      type: "passive",
      name: "Terrifying Laugh",
      description: "When attacked, inflict Bleeding on the enemy attacker, dealing ATK 50% DoT for 2 turn(s).",
      tags: ["apply-dot"],
    },
    {
      id: "telfer_bloody_grudge",
      type: "passive",
      name: "Bloody Grudge",
      description:
        "Dodge rate increases by 70% at the start of battle. This effect decreases by 10% each round. Attack increases by 10% upon Dodge. (Stacks up to 5 times)",
      tags: ["increase-self-dodge", "increase-self-attack"],
    },
    {
      id: "telfer_deep_hatred",
      type: "awaken",
      name: "Deep Hatred",
      description:
        "When you kill an enemy, you heal yourself by 35% of max HP and gain a buff that increases Dodge Rate by 55% for 2 turn(s).",
      tags: ["heal-self", "increase-self-dodge"],
    },
    {
      id: "telfer_engraving",
      type: "engraving",
      name: "Telfer's Engraving",
      description:
        "Increase ATK against strength-type enemies by 20%, and recover HP by 30% of damage dealt to strength-type enemies.",
      tags: ["increase-self-attack", "heal-self"],
    },
    {
      id: "telfer_mystic_cat_claws",
      type: "exclusive-equipment",
      name: "Mystic Cat Claws",
      description:
        "When dodging a Strength-type hero's attack, 60% chance to apply 2 stacks of Bleed to the attacker, dealing DoT equal to 60% of ATK for 3 turn(s).\nWhen using an Active Skill, removes all existing Bleed DoT from enemies adjacent to the target (including the target) that have at least 3 stacks of Bleed, then deals additional DoT equal to 150% of the total damage removed. This effect can Crit. If more than 3 Bleed stacks were removed, damage +50% per extra stack (Max +100%).",
      tags: ["apply-dot"],
    },
  ],
};
