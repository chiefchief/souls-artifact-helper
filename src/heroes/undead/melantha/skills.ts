import { heroImageUrl, type Hero } from "../../types";
export const melantha: Hero = {
  id: "melantha",
  name: "Melantha",
  rarity: "epic",
  race: "undead",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("undead", "melantha"),
  skills: [
    {
      id: "melantha_cursed_wings",
      type: "active",
      name: "Cursed Wings",
      description: "Deals 220% ATK damage to the enemy with the highest ATK and permanently reduces their ATK by 8%.",
      tags: ["reduce-attack"],
    },
    {
      id: "melantha_caring_umbrella",
      type: "passive",
      name: "Caring Umbrella",
      description:
        "If any ally in the same row, including Melantha, takes damage exceeding 35% of their max HP in a single attack, grants a shield equal to 200% of Melantha's ATK for 1 turns. (Up to 2 times per target)",
      tags: ["shield"],
    },
    {
      id: "melantha_graceful_composure",
      type: "passive",
      name: "Graceful Composure",
      description:
        "At the start of Melantha's turn, has a 100% chance to remove 1 debuff(s) from all allies in the same row.",
      tags: ["remove-ally-debuff"],
    },
    {
      id: "melantha_sun_ward",
      type: "passive",
      name: "Sun Ward",
      description: "When hit by a magic attack, reduces the enemy's Energy by 40.",
      statBonus: [{ stat: "mres", value: 10 }],
      tags: ["reduce-energy"],
    },
    {
      id: "melantha_wound_absorption",
      type: "awaken",
      name: "Wound Absorption",
      description:
        "Permanently increases the ATK of all other allies in the same row by 50% of the total ATK reduced by Melantha's skill. (The increased ATK cannot exceed 50% of Melantha's ATK.)",
      tags: ["increase-allies-attack", "reduce-attack"],
    },
    {
      id: "melantha_engraving",
      name: "Melantha's Engraving",
      type: "engraving",
      description:
        "Starting from round 3, active skills have a 50% chance to target the two enemies with the highest ATK. The chance increases to 100% from round 6.",
      tags: [],
    },
  ],
};
