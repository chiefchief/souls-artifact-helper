import { heroImageUrl, type Hero } from "../../types";
export const zagrako: Hero = {
  id: "zagrako",
  name: "Zagrako",
  rarity: "epic",
  race: "darkness",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("darkness", "zagrako"),
  skills: [
    {
      id: "zagrako_destructive_tempest",
      type: "active",
      name: "Destructive Tempest",
      description:
        "Deal ATK 140% damage to 1 enemy and all adjacent enemies, and have a 100% chance to Stun them for 1 turn(s).",
      tags: ["cc"],
    },
    {
      id: "zagrako_wild_strike",
      type: "passive",
      name: "Wild Strike",
      description:
        "ATK of normal attack increases by 50%. At the start of battle, increase the Lifesteal Rate of yourself and all adjacent allies by 45%. This effect lasts until 5 round(s) and cannot be removed.",
      tags: ["increase-allies-lifesteal"],
    },
    {
      id: "zagrako_forbidden_contract",
      type: "passive",
      name: "Forbidden Contract",
      description: "At the end of each round, if your HP is below 30%, gain 50 Energy.",
      statBonus: [{ stat: "mres", value: 20 }],
      tags: ["gain-energy"],
    },
    {
      id: "zagrako_demonic_path_of_flames",
      type: "passive",
      name: "Demonic Path of Flames",
      description:
        "If HP is below 40%, ATK increases by 20%. Upon death, revive after 2 round(s) with 50% HP and 50% Energy.",
      tags: ["increase-self-attack", "revive-self"],
    },
    {
      id: "zagrako_strange_power",
      type: "awaken",
      name: "Strange Power",
      description:
        "Upon death, apply a buff to all adjacent allies, increasing their ATK by 30% for 2 turn(s) and their Lifesteal Rate by 45% for 2 turn(s). (max 2 times per battle)",
      tags: ["increase-allies-lifesteal"],
    },
    {
      id: "zagrako_engraving",
      type: "engraving",
      name: "Zagrako's Engraving",
      description:
        "Every time you revive, ATK increases by 26%, DEF increases by 28%, and Lifesteal Rate increases by 25%. (Stacks up to 3 times)",
      statBonus: [{ stat: "lifesteal_rate", value: 15 }],
      tags: ["increase-self-attack", "increase-self-defense", "increase-self-lifesteal"],
    },
    {
      id: "zagrako_exclusive_equipment",
      type: "exclusive-equipment",
      name: "Destructive Force",
      description:
        "Upon death, Zagrako has a 60% chance to Stun each enemy hero for 1 turn, and a 100% chance to inflict a 20% Crit Weakness debuff for 2 turns. (Twice per battle) While Zagrako is dead, damage taken by adjacent allies is reduced by 15%.",
      tags: ["damage-reduction", "cc"],
    },
  ],
};
