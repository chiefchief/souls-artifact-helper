import { heroImageUrl, type Hero } from "../../types";
export const chiron: Hero = {
  id: "chiron",
  name: "Chiron",
  rarity: "epic",
  race: "elf",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("elf", "chiron"),
  skills: [
    {
      id: "chiron_vine_seed",
      type: "active",
      name: "Vine Seed",
      description:
        "Deals 190% ATK damage to 1 enemy and has a 80% chance to Entangle the target for 2 turns. (Entangled has a 50% chance to ignore CC removal effects.)",
      tags: ["cc"],
    },
    {
      id: "chiron_absorption_seed",
      type: "passive",
      name: "Absorption Seed",
      description:
        "Absorbs 10% of the target's max HP on normal attacks. (Cannot exceed 15% of Chiron's max HP and is unaffected by healing-related effects.)",
      tags: [],
    },
    {
      id: "chiron_forests_blessing",
      type: "passive",
      name: "Forest's Blessing",
      description: "Chiron becomes immune to buffs and debuffs until round 3.",
      statBonus: [{ stat: "pres", value: 15 }],
      tags: [],
    },
    {
      id: "chiron_sentinel",
      type: "passive",
      name: "Sentinel",
      description:
        "Recovers 30% HP and survives when receiving fatal damage, and inflicts 30% ATK Reduction on the attacker for 2 turns. (Once per battle)",
      tags: ["reduce-attack", "survive"],
    },
    {
      id: "chiron_thornvine_armor",
      type: "awaken",
      name: "Thornvine Armor",
      description:
        "Chiron applies a Seed debuff to the target when he is hit by a critical hit from an Active Skill or normal attack (up to 4 times per round)\nAt the start of each round, removes all Seed debuffs from affected enemies, with a 100% chance to Entangle them for 1 turn.\nEnemies with the Seed debuff have their CC Resistance reduced by 15%.",
      tags: ["reduce-cc-resistance", "cc"],
    },
    {
      id: "chiron_engraving",
      type: "engraving",
      name: "Chiron's Engraving",
      description:
        "When using an Active Skill, absorbs 15% of the max HP of all Entangled enemies, including the target. (Cannot exceed 20% of Chiron's max HP and is unaffected by healing-related effects.)",
      tags: [],
    },
  ],
};
