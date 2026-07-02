import { heroImageUrl, type Hero } from "../../types";
export const lupico: Hero = {
  id: "lupico",
  name: "Lupico",
  rarity: "epic",
  race: "horde",
  role: "supporter",
  attribute: "strength",
  imageUrl: heroImageUrl("horde", "lupico"),
  skills: [
    {
      id: "lupico_flaming_cannon",
      type: "active",
      name: "Flaming Cannon",
      description:
        "Attacks the closest enemy Supporter and all adjacent enemies, dealing ATK 140% damage and inflicting burn, dealing ATK 60% continuous damage for 3 turns. (If no supporter exists, targets the primary target.)",
      tags: ["apply-dot"],
    },
    {
      id: "lupico_steel_teeth",
      type: "passive",
      name: "Steel Teeth",
      description:
        "Normal attack targets the closest enemy Supporter, inflicting burn for 2 turns, dealing ATK 60% continuous damage. (If no supporter exists, targets the primary target.)",
      tags: ["apply-dot"],
    },
    {
      id: "lupico_penguins_pride",
      type: "passive",
      name: "Penguin's Pride",
      description:
        "When Lupico's HP drops below 60%, heals himself and 2 allies with the lowest HP for 30% of Lupico's max HP and removes all debuffs. (Once per battle)",
      tags: ["heal-self", "remove-self-debuff", "remove-ally-debuff"],
    },
    {
      id: "lupico_flame_energy",
      type: "passive",
      name: "Flame Energy",
      description:
        "Gains 50 energy at the start of the battle. Reduces the energy of burned enemies by 25 at the end of each round.",
      tags: ["gain-energy", "reduce-energy"],
    },
    {
      id: "lupico_ruler_of_the_sea",
      type: "awaken",
      name: "Ruler of the Sea",
      description:
        "While Lupico is alive, all allies, including Lupico, deal 40% increased continuous damage from burn and bleed effects.",
      tags: [],
    },
    {
      id: "lupico_engraving",
      type: "engraving",
      name: "Lupico's Engraving",
      description:
        "When using an active attack, increases the energy of 3 allies with the highest attack by 20 per enemy hit.",
      statBonus: [{ stat: "mres", value: 15 }],
      tags: ["give-energy"],
    },
    {
      id: "lupico_sh_4rk_cannon",
      type: "exclusive-equipment",
      name: "SH-4RK Cannon",
      description:
        "Reduces damage taken by yourself and allies from enemy Elf Supporter heroes by 30%. Until round 3, Lupico reduces the Energy of a random enemy Supporter hit by his Active Skill by 50.",
      tags: ["damage-reduction", "reduce-energy"],
    },
  ],
};
