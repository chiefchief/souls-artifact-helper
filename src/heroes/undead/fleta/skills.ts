import { heroImageUrl, type Hero } from "../../types";
export const fleta: Hero = {
  id: "fleta",
  name: "Fleta",
  rarity: "epic",
  race: "undead",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("undead", "fleta"),
  skills: [
    {
      id: "fleta_ravage",
      type: "active",
      name: "Ravage",
      description: "Deal ATK 255% damage to the enemy with the lowest HP.",
      tags: [],
    },
    {
      id: "fleta_desperate_destruction",
      type: "passive",
      name: "Desperate Destruction",
      description:
        "Normal attack deals ATK 135% damage to the enemy with the lowest HP and remove 1 buff(s) from it. Each time a buff is removed, your Dodge Rate increases by 8%. (max 5 stacks)",
      tags: ["increase-self-dodge", "remove-enemy-buff"],
    },
    {
      id: "fleta_mad_slaughter",
      type: "passive",
      name: "Mad Slaughter",
      description: "When HP is below 50%, Dodge Rate increases by 50%.",
      tags: ["increase-self-dodge"],
    },
    {
      id: "fleta_defense_mechanism",
      type: "passive",
      name: "Defense Mechanism",
      description: "Whenever an ally dies, ATK increases permanently by 13%. (max 5 stacks)",
      tags: [],
    },
    {
      id: "fleta_uneasy_heart",
      type: "awaken",
      name: "Uneasy Heart",
      description:
        "When you kill an enemy, heal yourself by 35% of max HP and gain a buff that increases ATK by 20% for 2 turns.",
      tags: ["heal-self"],
    },
    {
      id: "fleta_engraving",
      type: "engraving",
      name: "Fleta's Engraving",
      description:
        "Receive 50 energy upon defeating an enemy, with a 20% chance of receiving a Damage Immune Shield for 1 turn.",
      tags: ["execute", "gain-energy"],
    },
    {
      id: "fleta_crescent_of_death",
      type: "exclusive-equipment",
      name: "Crescent of Death",
      description:
        "Immediately after the start of each round, if own Energy is 100 or higher, applies Fleta's Mark to the enemy hero with the lowest HP for 1 turn.\nEnemy heroes affected by Fleta's Mark have their Healing Received reduced by 80% and Dodge Rate reduced by 30%.\nWhen Fleta attacks an enemy affected by Fleta's Mark, there is a 100% chance to ignore effects that prevent damage from exceeding a certain proportion of Max HP. (This effect does not apply to additional actions taken by Fleta in the same turn the mark was applied.)",
      tags: ["damage-cap", "reduce-healing-received"],
    },
  ],
};
