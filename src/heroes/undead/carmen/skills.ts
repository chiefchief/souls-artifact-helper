import { heroImageUrl, type Hero } from "../../types";
export const carmen: Hero = {
  id: "carmen",
  name: "Carmen",
  rarity: "epic",
  race: "undead",
  role: "dealer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("undead", "carmen"),
  skills: [
    {
      id: "carmen_pool_of_poison",
      type: "active",
      name: "Pool of Poison",
      description:
        "Inflict Poison on all enemies, dealing ATK 62% DoT for 3 turn(s). Additionally, enemies inflicted by Carmen's Poison cannot be revived. (Carmen starts with full energy)",
      tags: ["apply-dot", "prevent-revive"],
    },
    {
      id: "carmen_horn_incenser",
      type: "passive",
      name: "Horn Incenser",
      description: "ATK increases by 30% against enemies in the Poison state.",
      tags: ["increase-self-attack"],
    },
    {
      id: "carmen_banned_substances",
      type: "passive",
      name: "Banned Substances",
      description: "At the start of every 3 round(s), gain a buff that increases ATK by 25% for 2 turn(s).",
      tags: ["increase-self-attack"],
    },
    {
      id: "carmen_hidden_power",
      type: "passive",
      name: "Hidden Power",
      description: "At the start of each round, heal yourself by 6% of max HP for each enemy inflicted by Poison.",
      statBonus: [{ stat: "def", value: 12 }],
      tags: ["heal-self"],
    },
    {
      id: "carmen_violent_witch",
      type: "awaken",
      name: "Violent Witch",
      description:
        "Just before death, gain a Shield equal to 65% of max HP and survive. The Shield lasts for 2 turn(s) and additionally gain 100 Energy. (once per battle)",
      tags: ["gain-energy", "shield", "survive"],
    },
    {
      id: "carmen_engraving",
      type: "engraving",
      name: "Carmen's Engraving",
      description:
        "When attacked, apply Poison to the enemy, and deal DoT of 50% ATK for 2 turns. Every 3 times you are attacked, your ATK permanently increases by 7%.",
      tags: ["apply-dot", "increase-self-attack"],
    },
    {
      id: "carmen_venomous_censer",
      type: "exclusive-equipment",
      name: "Venomous Censer",
      description:
        "When an enemy afflicted with Carmen's Poison dies, spreads Poison to adjacent enemies, dealing 62% ATK as damage over time for 2 turns.\nIf Carmen is placed in the first row, she cannot take more than 30% of her max HP as damage from a single attack until round 3.",
      tags: ["apply-dot", "damage-cap"],
    },
  ],
};
