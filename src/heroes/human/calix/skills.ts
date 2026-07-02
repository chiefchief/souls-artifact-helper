import { heroImageUrl, type Hero } from "../../types";
export const calix: Hero = {
  id: "calix",
  name: "Calix",
  rarity: "epic",
  race: "human",
  role: "supporter",
  attribute: "agility",
  imageUrl: heroImageUrl("human", "calix"),
  skills: [
    {
      id: "calix_piercing_blow",
      type: "active",
      name: "Piercing Blow",
      description:
        "Deal ATK 145% damage to 1 enemy and all enemies in a straight path behind it, applying a debuff that reduces DEF by 40% for 2 turn(s).",
      tags: ["reduce-defense"],
    },
    {
      id: "calix_inexorable_strike",
      type: "passive",
      name: "Inexorable Strike",
      description: "Normal attack deals ATK 100% damage to 1 enemy and adjacent enemies behind it.",
      statBonus: [
        { stat: "def", value: 10 },
        { stat: "crit_def", value: 25 },
      ],
      tags: [],
    },
    {
      id: "calix_guardian_knight",
      type: "passive",
      name: "Guardian Knight",
      description:
        "When attacked, increase Energy of the ally with the highest ATK, including Calix, by 50 at a 100% chance. (max once per round)",
      tags: ["give-energy"],
    },
    {
      id: "calix_survival_skill",
      type: "passive",
      name: "Survival Skill",
      description: "At the start of every 4 round(s), heal 50% of max HP.",
      tags: [],
    },
    {
      id: "calix_honorable_knight",
      type: "awaken",
      name: "Honorable Knight",
      description:
        "At the start of every 2 round(s), increase the Energy of Calix and the ally with the highest ATK by 40. Whenever this effect is triggered, the effect increases by 5. (max 50)",
      tags: ["gain-energy", "give-energy"],
    },
    {
      id: "calix_engraving",
      type: "engraving",
      name: "Calix's Engraving",
      description:
        "Gain an additional 20 energy when attacked, and apply a debuff that increases damage taken by 20% for 1 turns.",
      tags: ["gain-energy", "increase-damage-taken"],
    },
  ],
};
