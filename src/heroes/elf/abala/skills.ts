import { heroImageUrl, type Hero } from "../../types";
export const abala: Hero = {
  id: "abala",
  name: "Abala",
  rarity: "epic",
  race: "elf",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("elf", "abala"),
  skills: [
    {
      id: "abala_giant_strike",
      type: "active",
      name: "Giant Strike",
      description: "Deals ATK 190% damage to the enemy with the highest ATK and apply a Provoked debuff for 2 turn(s).",
      tags: ["taunt"],
    },
    {
      id: "abala_world_trees_blessing",
      type: "passive",
      name: "World Tree's Blessing",
      description:
        "From round 2, at the start of every 2 round(s), you apply a Shield to the ally with the lowest HP, equal to 130% of your ATK, for 2 turn(s).",
      tags: ["shield"],
    },
    {
      id: "abala_constricting_roots",
      type: "passive",
      name: "Constricting Roots",
      description: "Damage Taken from Provoked enemies reduces by 55%. Gain 50 Energy at the start of battle.",
      tags: ["damage-reduction", "gain-energy"],
    },
    {
      id: "abala_thick_skin",
      type: "passive",
      name: "Thick Skin",
      description: "At the start of each round, DEF increases by 8%. (max 5 stacks)",
      statBonus: [
        { stat: "pres", value: 10 },
        { stat: "pen", value: 10 },
      ],
      tags: ["increase-self-defense"],
    },
    {
      id: "abala_ancient_mystery",
      type: "awaken",
      name: "Ancient Mystery",
      description:
        "Upon attacking, heal yourself by 40% of the damage dealt. This effect increases by 5% every round. (max 75%)",
      tags: ["heal-self"],
    },
    {
      id: "abala_engraving",
      type: "engraving",
      name: "Abala's Engraving",
      description:
        "Increase ATK by 14% permanently whenever an ally dies, and have a 50% chance to apply a Provoke debuff to the enemy that defeated the ally for 1 turn.",
      tags: ["increase-self-attack", "taunt"],
    },
    {
      id: "abala_abalas_secret_apple",
      type: "exclusive-equipment",
      name: "Abala's Secret Apple",
      description:
        "When using Active Skill, removes 2 buffs from the target.\nEnemies taunted by Abala have their Crit Rate reduced by 50%.",
      tags: ["reduce-crit-rate", "remove-enemy-buff"],
    },
  ],
};
