import { heroImageUrl, type Hero } from "../../types";
export const ripper: Hero = {
  id: "ripper",
  name: "Ripper",
  rarity: "epic",
  race: "undead",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("undead", "ripper"),
  skills: [
    {
      id: "ripper_surprise_gift",
      type: "active",
      name: "Surprise Gift",
      description:
        "Drop a Bomb on 1 near enemy in the back row and all adjacent enemies to deal damage of 110% ATK, and apply Bomb debuff.\n※ The Bomb will explode 2 turns later and deal damage of 25% ATK. If disarmed, it will deal 4.7 times the damage immediately.",
      tags: [],
    },
    {
      id: "ripper_rippers_blessing",
      type: "passive",
      name: "Ripper's Blessing",
      description:
        "Normal attack deals damage of 120% ATK to 1 nearby enemy in the back row, and apply a buff that increases Dodge Rate by 25% for 2 turns to 2 allies with low HP.",
      tags: ["increase-self-dodge"],
    },
    {
      id: "ripper_agile_movements",
      type: "passive",
      name: "Agile Movements",
      description:
        "Increase Dodge Rate by 30% until Round 3. When HP is below 50%, further increase Dodge Rate by 32%.",
      statBonus: [{ stat: "def", value: 14 }],
      tags: ["increase-self-dodge"],
    },
    {
      id: "ripper_fatalist",
      type: "passive",
      name: "Fatalist",
      description:
        "Every time 1 ally dies, increase Dodge Rate of all allies by 8%, and reduce Dodge Rate of all enemies by 7%.",
      tags: ["increase-self-dodge"],
    },
    {
      id: "ripper_ace_card",
      type: "awaken",
      name: "Ace Card",
      description:
        "Increase Dodge Rate of all allies in the same row including yourself by 16%. When attacking enemies with more than 100% energy, you have a 70% chance of reducing their energy by 25~55.",
      tags: ["increase-self-dodge"],
    },
    {
      id: "ripper_engraving",
      type: "engraving",
      name: "Ripper's Engraving",
      description:
        "Ripper heals 12% of max HP and increases ATK by 5% whenever an ally Dodges. (Stacks up to 10 times)",
      tags: ["heal-self", "increase-self-attack"],
    },
    {
      id: "ripper_magnum_opus",
      type: "exclusive-equipment",
      name: "Magnum Opus",
      description:
        "When an ally dodges an Active Skill or Normal Attack, Ripper has a 100% chance to counterattack for 100% of ATK and remove 1 Bomb debuff from the target. (Once per round)\nRipper hides in the shadows for 1 turn after defeating an enemy. (Once per battle)",
      tags: ["counter-attack", "execute", "remove-ally-debuff"],
    },
  ],
};
