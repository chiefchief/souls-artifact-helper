import { heroImageUrl, type Hero } from "../../types";
export const olga: Hero = {
  id: "olga",
  name: "Olga",
  rarity: "epic",
  race: "human",
  role: "supporter",
  attribute: "strength",
  imageUrl: heroImageUrl("human", "olga"),
  skills: [
    {
      id: "olga_freezing_strike",
      type: "active",
      name: "Freezing Strike",
      description:
        "Deal ATK 165% damage to 1 enemy and all adjacent enemies, while applying a buff that increases CC resistance of you and all adjacent allies by 100% for 2 turn(s).\n(Olga starts battle with full Energy)",
      tags: ["increase-cc-resistance"],
    },
    {
      id: "olga_leadership_awakening",
      type: "passive",
      name: "Leadership Awakening",
      description: "Increase the DEF of yourself and all allies adjacent to you by 27% of (Olga's) DEF until round 3.",
      tags: ["increase-allies-defense"],
    },
    {
      id: "olga_frigid_cold",
      type: "passive",
      name: "Frigid Cold",
      description:
        "When attacked, apply a Cold debuff to the enemy attacker for 1 turn. (4 time(s) per battle)\n※ Enemies in the Cold state have 55% chance to be Frozen for 1 turn when attacked.",
      statBonus: [{ stat: "damage_reduction", value: 15 }],
      tags: [],
    },
    {
      id: "olga_heroism",
      type: "passive",
      name: "Heroism",
      description: "At the start of every 4 round(s), heal 35% of max HP.",
      tags: [],
    },
    {
      id: "olga_counterattack",
      type: "awaken",
      name: "Counterattack",
      description:
        "If HP is below 50%, counterattack and gain a Shield for 3 turn(s), equal to 70% of the damage dealt during the counterattack.",
      tags: ["counter-attack", "shield"],
    },
    {
      id: "olga_engraving",
      type: "engraving",
      name: "Olga's Engraving",
      description:
        "When HP is below 50%, DEF increases by 30%. When receiving an attack that would make HP drop below 30%, you receive a buff that reduces damage taken by 30% for 2 turns. (Once per battle)",
      tags: ["damage-reduction", "increase-self-defense"],
    },
    {
      id: "olga_winterbringer",
      type: "exclusive-equipment",
      name: "Winterbringer",
      description:
        "When Olga is placed in the first row, the following effect is activated.\nWhen Olga uses an active skill, she has a 50% chance to inflict a Cold debuff on hit enemies for 1 turn.\nWhen Olga dies, she inflicts Freeze on the hero who killed her for 1 turn.\nWhen Olga takes a fatal hit, she survives with 1 HP and restores 49% of her Max HP. (Once per battle)\nAdditionally, her damage taken is reduced by 3% for each enemy affected by Cold debuff. (Damage reduction can stack up to 5 times)",
      tags: ["damage-reduction", "survive"],
    },
  ],
};
