import { heroImageUrl, type Hero } from "../../types";
export const kyle: Hero = {
  id: "kyle",
  name: "Kyle",
  rarity: "epic",
  race: "human",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("human", "kyle"),
  skills: [
    {
      id: "kyle_back_line_attack",
      type: "active",
      name: "Back line attack",
      description:
        "Deal damage (140% of ATK) to 1 enemy and all enemies in the row behind them, and stun them for 1 turn(s) at a 70% chance.",
      tags: ["cc"],
    },
    {
      id: "kyle_straight_rappier",
      type: "passive",
      name: "Straight rappier",
      description: "Increase ATK of normal attacks by 40% and permanently reduce DEF of enemies by 10%.",
      tags: ["reduce-attack", "reduce-defense"],
    },
    {
      id: "kyle_counterattack_preparation",
      type: "passive",
      name: "Counterattack Preparation",
      description:
        "Every time you directly receive damage, your ATK permanently increases by 5% of the ATK of the enemy that attacked you. (max 10 times)",
      tags: [],
    },
    {
      id: "kyle_nullify",
      type: "passive",
      name: "Nullify",
      description:
        "When your HP falls below 50%, apply Heal Over Time to yourself and heal 120% of your ATK for 2 turns. Also, remove all crowd control and debuffs on you. (1 time per battle)",
      tags: ["healing-over-time", "remove-ally-debuff", "remove-cc"],
    },
    {
      id: "kyle_mortal_wound_dodge",
      type: "awaken",
      name: "Mortal Wound Dodge",
      description:
        "The lower your HP is, the less damage you receive. (For each 1% of HP, damage received reduce by 0.45%)",
      statBonus: [{ stat: "crit_def", value: 35 }],
      tags: [],
    },
    {
      id: "kyle_engraving",
      type: "engraving",
      name: "Kyle's Engraving",
      description:
        'If you directly receive damage 4 times, you turn into Wind Wish state for 2 turns. In the "Wind Wish" state, Dodge Rate increases by 100%, ATK increases by 50% (1 time per battle, cannot be removed)',
      tags: [],
    },
    {
      id: "kyle_rose_knight",
      type: "exclusive-equipment",
      name: "Rose Knight",
      description:
        "The activation condition for Wind Wish changes to [when allies in the same row, including self, take direct attack damage 4 times], and when Kyle acquires Wind Wish, he gains 100 Energy.\nWhile affected by Wind Wish, Kyle ignores effects that prevent damage dealt to enemies from exceeding a certain percentage of max HP when attacking. Additionally, when he directly defeats an enemy, the duration of Wind Wish increases by 2 turns and he gains 100 Energy.",
      tags: ["damage-cap", "gain-energy"],
    },
  ],
};
