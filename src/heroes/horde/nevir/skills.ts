import { heroImageUrl, type Hero } from "../../types";
export const nevir: Hero = {
  id: "nevir",
  name: "Nevir",
  rarity: "epic",
  race: "horde",
  role: "dealer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("horde", "nevir"),
  skills: [
    {
      id: "nevir_yin_yang_art_tiger",
      type: "active",
      name: "Yin-Yang Art: Tiger",
      description:
        "Deals 175% ATK damage to 3 nearby enemies with a 100% chance to inflict [Ink] for 2 turns. [Ink] removes shields. (Excludes Damage Immunity and Nullification Shield)",
      tags: ["anti-shield", "shield"],
    },
    {
      id: "nevir_ink_drawing",
      type: "passive",
      name: "Ink Drawing",
      description: "Attacks the enemy with the highest Energy, dealing 130% ATK damage and absorbing 30 Energy.",
      tags: ["absorb-energy"],
    },
    {
      id: "nevir_tri_ink_technique",
      type: "passive",
      name: "Tri-Ink Technique",
      description:
        "For each [Ink] debuff on an enemy hero, Nevir reduces their Magic Resistance by 15%. (Up to 30%, excludes bosses)",
      statBonus: [{ stat: "acc", value: 30 }],
      tags: [],
    },
    {
      id: "nevir_ink_and_inkstone",
      type: "passive",
      name: "Ink and Inkstone",
      description:
        "Gains 10 Energy when an allied hero uses an Active Skill. Gains an additional 10 Energy when a Horde hero uses an Active Skill.",
      tags: ["gain-energy"],
    },
    {
      id: "nevir_battlefield_artist",
      type: "awaken",
      name: "Battlefield Artist",
      description:
        "If Nevir's Energy is 120 or lower, Energy gain rate increases by 50%. (Does not apply to Energy gained from attacking or being hit.)\nIf Energy is full after using an Active Skill, has a 100% chance to immediately reuse the Active Skill.",
      tags: ["increase-energy-gain", "repeat-attack"],
    },
    {
      id: "nevir_engraving",
      type: "engraving",
      name: "Nevir's Engraving",
      description:
        "Gains +10% Crit DMG each time an Active Skill is used. (Once per round, up to 50%)\nGains 50 Energy when an enemy or ally dies. (Twice per battle)",
      tags: ["gain-energy", "increase-self-crit-damage"],
    },
  ],
};
