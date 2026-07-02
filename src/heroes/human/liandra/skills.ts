import { heroImageUrl, type Hero } from "../../types";
export const liandra: Hero = {
  id: "liandra",
  name: "Liandra",
  rarity: "epic",
  race: "human",
  role: "tanker",
  attribute: "intelligence",
  imageUrl: heroImageUrl("human", "liandra"),
  skills: [
    {
      id: "liandra_mace_of_judgment",
      type: "active",
      name: "Mace of Judgment",
      description:
        "Deals 120% ATK DMG to all enemies. Additionally, Active Skill ignores enemy shields.(Excludes damage-immune shields and nullification shields)",
      tags: ["shield"],
    },
    {
      id: "liandra_divine_blessing",
      type: "passive",
      name: "Divine Blessing",
      description: "Normal Attacks permanently reduce the target's DEF by 5%.",
      statBonus: [{ stat: "hp", value: 10 }],
      tags: ["reduce-defense"],
    },
    {
      id: "liandra_paladins_ward",
      type: "passive",
      name: "Paladin's Ward",
      description:
        "Liandra's Physical Resistance is increased by 50%. This effect decreases as HP drops. (Physical Resistance -0.3% per 1% HP, minimum 20%)",
      tags: [],
    },
    {
      id: "liandra_prayer_of_protection",
      type: "passive",
      name: "Prayer of Protection",
      description: "At the start of the round, if your HP is 50% or below, recover 50% of Max HP. (Once per battle)",
      tags: [],
    },
    {
      id: "liandra_unshakable_faith",
      type: "awaken",
      name: "Unshakable Faith",
      description:
        "When an enemy hero is healed 3 times by Active Skills, Liandra gains 1 stack of Paladin's Ward. Liandra gains +20% ATK and +20% Accuracy, and +10% Damage Reduction per stack of Paladin's Ward she has. (Up to 5 stacks)\nIf Liandra has 3 or more stacks of Paladin's Ward when using her Active Skill, she removes 1 buff from all enemies and reduces their Healing Rate by 70% for 2 turns. (Once per round)",
      tags: ["damage-reduction", "reduce-attack", "remove-enemy-buff"],
    },
    {
      id: "liandra_engraving",
      type: "engraving",
      name: "Liandra's Engraving",
      description:
        "When an enemy hero is healed 3 times by Active Skills, grant a Paladin's Ward buff to the ally hero with the lowest HP among those without a Paladin's Ward, lasting 2 turns. This effect does not trigger if Liandra has 5 Paladin's Ward buffs.\nAllies (except Liandra) with Paladin's Ward buffs gain +15% Crit Resist and +10% Crit Defense. In addition, ally Intelligence heroes (except Liandra) with Paladin's Ward buffs gain 30 Energy at the start of each round.",
      tags: ["give-energy", "heal-allies"],
    },
  ],
};
