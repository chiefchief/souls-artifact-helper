import { heroImageUrl, type Hero } from "../../types";
export const coco: Hero = {
  id: "coco",
  name: "CoCo",
  rarity: "epic",
  race: "elf",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("elf", "coco"),
  skills: [
    {
      id: "coco_spirit_explosion",
      type: "active",
      name: "Spirit Explosion",
      description: "Deal damage (140% of ATK) to 1 enemy and all adjacent enemies, and remove 1 buffs.",
      tags: ["remove-enemy-buff"],
    },
    {
      id: "coco_fairys_aid",
      type: "passive",
      name: "Fairy's Aid",
      description:
        "Increase ATK of normal attacks by 30%. In addition, when attacking enemies with higher DEF than you, ATK increases by 16%.",
      tags: [],
    },
    {
      id: "coco_grace_of_protection",
      type: "passive",
      name: "Grace of Protection",
      description:
        "When the HP of allies on the same row falls below 60%, apply Grace of Protection buff for 2 turns. (3 times per battle)\n※ Allies with Grace of Protection will not receive damage of more than 20% of max HP on one attack.",
      tags: ["damage-cap"],
    },
    {
      id: "coco_power_of_life",
      type: "passive",
      name: "Power of Life",
      description:
        "When HP drops below 50%, apply HoT to yourself and recover 80% of ATK for 2 turns. (1 times per combat)",
      tags: ["heal-self", "healing-over-time"],
    },
    {
      id: "coco_magic_ward",
      type: "awaken",
      name: "Magic Ward",
      description:
        "Every time an ally dies, reduce 100 energy of 1 enemies with high energy, and apply Silence debuff for 1 turns.",
      tags: ["reduce-energy", "silence"],
    },
    {
      id: "coco_engraving",
      type: "engraving",
      name: "CoCo's Engraving",
      description: "50% chance to gain 30 energy whenever an enemy uses an Active Skill.",
      tags: ["gain-energy"],
    },
    {
      id: "coco_elf_fairys_crystal_orb",
      type: "exclusive-equipment",
      name: "Elf Fairy's Crystal Orb",
      description:
        "Increases the number of buffs removed when hitting with an active skill by 1. When attacking enemies in the first row with an active skill, there is a 100% chance to apply a Buff Block debuff for 1 turn, preventing them from receiving any buff effects. Enemies affected by Buff Block also lose all shields.",
      statBonus: [{ stat: "atk", value: 15 }],
      tags: ["anti-shield", "buff-block"],
    },
  ],
};
