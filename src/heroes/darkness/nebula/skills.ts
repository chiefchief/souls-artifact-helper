import { heroImageUrl, type Hero } from "../../types";
export const nebula: Hero = {
  id: "nebula",
  name: "Nebula",
  rarity: "epic",
  race: "darkness",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("darkness", "nebula"),
  skills: [
    {
      id: "nebula_tentacle_bomber",
      type: "active",
      name: "Tentacle Bomber",
      description:
        "Strike the nearest enemy in the back row and all adjacent enemies with tentacles, dealing 135% attack damage and applying a critical weakness debuff that increases the chance of being critically hit by 30% for 2 turns.",
      tags: [],
    },
    {
      id: "nebula_spooky_girl",
      type: "passive",
      name: "Spooky Girl",
      description: "Normal attack deals ATK 135% damage to the nearest enemy in the back row.",
      statBonus: [{ stat: "hp", value: 12 }],
      tags: [],
    },
    {
      id: "nebula_suction_recovery",
      type: "passive",
      name: "Suction Recovery",
      description:
        "At the start of each round until round 5, grant continuous healing to the ally with the lowest HP, healing them for 75% of attack power for 2 turns.",
      tags: ["heal-allies", "healing-over-time"],
    },
    {
      id: "nebula_second_heart",
      type: "passive",
      name: "Second Heart",
      description:
        "When Nebula's HP falls below 70% or 40%, immediately heal Nebula and adjacent allies for 30% of Nebula's max HP and remove all debuffs. (Once per battle)",
      tags: ["heal-allies", "remove-ally-debuff"],
    },
    {
      id: "nebula_hidden_ferocity",
      type: "awaken",
      name: "Hidden Ferocity",
      description:
        "Starting from round 2, increase attack power by 6% at the beginning of each round. (Stacks up to 10 times)",
      statBonus: [{ stat: "crit_rate", value: 15 }],
      tags: [],
    },
    {
      id: "nebula_engraving",
      type: "engraving",
      name: "Nebula's Engraving",
      description:
        "Reduce the continuous damage received by yourself and all adjacent allies by 50%. If there is a continuous damage debuff, all (normal and active) attacks will reduce the target's energy by 25.",
      tags: ["damage-reduction", "reduce-dot-damage", "reduce-energy"],
    },
  ],
};
