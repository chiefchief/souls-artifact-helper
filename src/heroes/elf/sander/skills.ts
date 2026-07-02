import { heroImageUrl, type Hero } from "../../types";
export const sander: Hero = {
  id: "sander",
  name: "Sander",
  rarity: "epic",
  race: "elf",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("elf", "sander"),
  skills: [
    {
      id: "sander_gale_surge",
      type: "active",
      name: "Gale Surge",
      description:
        "Deal ATK 235% damage to 1 enemy. Additionally, for 2 turn(s), reduce the enemy's Speed by 14 and increase the Speed of adjacent allies by 14.",
      tags: ["increase-allies-speed", "reduce-enemy-speed"],
    },
    {
      id: "sander_forest_defense_squad",
      type: "passive",
      name: "Forest Defense Squad",
      description:
        "ATK of normal attack increases by 35%. At the end of each round, you remove 1 debuff(s) from yourself and all allies adjacent to you.",
      tags: ["remove-ally-debuff"],
    },
    {
      id: "sander_protective_color",
      type: "passive",
      name: "Protective Color",
      description:
        "Just before death, you become transparent and survive. When you become transparent, it lasts for 2 turn(s) and you gain 100 Energy. (once per battle)\n※ When transparent, cannot be targeted.",
      tags: ["gain-energy", "survive"],
    },
    {
      id: "sander_fearless_resolve",
      type: "passive",
      name: "Fearless Resolve",
      description:
        "Upon removing a debuff, gain 20 Energy for each debuff removed ally. When using an active skill, consumes all Energy to deal greater damage.",
      tags: ["gain-energy", "remove-enemy-buff"],
    },
    {
      id: "sander_disarm",
      type: "awaken",
      name: "Disarm",
      description: "Deal additional damage equal to 80% of the ignored amount through penetration.",
      statBonus: [{ stat: "pen", value: 45 }],
      tags: [],
    },
    {
      id: "sander_engraving",
      type: "engraving",
      name: "Sander's Engraving",
      description:
        "Increase ATK against strength-type enemies by 20%. If you are transparent, it will increase by an additional 12%.",
      tags: [],
    },
    {
      id: "sander_tempest",
      type: "exclusive-equipment",
      name: "Tempest",
      description:
        "Sander gains 50 Energy whenever an ally dies. (This effect also applies while in Invisible state)\nWhen using an Active Skill, absorbs 45% of the target's Energy (once per round).",
      tags: ["absorb-energy", "gain-energy"],
    },
  ],
};
