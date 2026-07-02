import { heroImageUrl, type Hero } from "../../types";
export const louveti: Hero = {
  id: "louveti",
  name: "Louveti",
  rarity: "epic",
  race: "undead",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("undead", "louveti"),
  skills: [
    {
      id: "louveti_annihilation_round",
      type: "active",
      name: "Anihilation Round",
      description:
        "Attacks the nearest enemy in the back row, dealing 195% of ATK as damage and inflicts a Shield Prevention debuff for 1 turns, preventing all shield gains. Additionally deals 120% damage to adjacent enemies.",
      tags: [],
    },
    {
      id: "louveti_precision_shot",
      type: "passive",
      name: "Precision Shot",
      description: "Deals 140% of ATK as damage to the nearest enemy in the back row.",
      tags: [],
    },
    {
      id: "louveti_aim",
      type: "passive",
      name: "Aim",
      description: "When landing a Crit with an Active Skill, gain 20 Energy. (Once per round)",
      statBonus: [{ stat: "crit_def", value: 25 }],
      tags: ["gain-energy"],
    },
    {
      id: "louveti_moonlight_aura",
      type: "passive",
      name: "Moonlight Aura",
      description:
        "At the start of every 2 rounds, if there are no active buffs on self, gain a buff that increases ATK by 25% for 2 turns.",
      tags: ["increase-self-attack"],
    },
    {
      id: "louveti_sharp_senses",
      type: "awaken",
      name: "Sharp Senses",
      description:
        "Immediately removes all debuffs from self and increases own Energy by 100 when current HP falls below 60%. (Once per battle)",
      tags: [],
    },
    {
      id: "louveti_engraving",
      type: "engraving",
      name: "Louveti's Engraving",
      description: "Increases Crit Rate and Accuracy against Agility-type enemies by 20%.",
      tags: ["increase-self-accuracy"],
    },
    {
      id: "louveti_silver_bullet",
      type: "exclusive-equipment",
      name: "Silver Bullet",
      description:
        "When Louveti attacks, ignores 15% of the target's Dodge Rate for each debuff on the target. (Max 30%)\nSeason Chapter Exclusive: Increases damage dealt by 10% for each debuff on the target when attacking. (Max 30%)",
      tags: [],
    },
  ],
};
