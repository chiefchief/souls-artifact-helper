import { heroImageUrl, type Hero } from "../../types";
export const taros: Hero = {
  id: "taros",
  name: "Taros",
  rarity: "epic",
  race: "light",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("light", "taros"),
  skills: [
    {
      id: "taros_thunder_clap",
      type: "active",
      name: "Thunder Clap",
      description:
        "Deal ATK 130% damage to 2x enemies with high ATK, and apply a debuff that reduces their ATK by 20% for 2 turn(s).",
      tags: ["reduce-attack"],
    },
    {
      id: "taros_righteous_judgment",
      type: "passive",
      name: "Righteous Judgment",
      description: "When HP is below 50%, Damage Taken reduces by 30%.",
      statBonus: [
        { stat: "pres", value: 10 },
        { stat: "dodge_rate", value: 15 },
      ],
      tags: ["damage-reduction"],
    },
    {
      id: "taros_divine_shield",
      type: "passive",
      name: "Divine Shield",
      description:
        "If your HP falls below 35%, heal yourself by 30% of max HP. Upon death, apply a Damage Immunity Shield to 1 random ally in the front row for 1 turn. (once per battle)",
      tags: ["heal-self", "shield"],
    },
    {
      id: "taros_iron_will",
      type: "passive",
      name: "Iron Will",
      description:
        "At the start of every round, apply a buff to 2x ally with low HP, reducing the Damage Taken by 15% for 1 turn(s).",
      tags: [],
    },
    {
      id: "taros_apocalyptic_tome",
      type: "awaken",
      name: "Apocalyptic Tome",
      description: "Upon death, revive at the end of the current round with 80% HP and 120% Energy. (once per battle)",
      tags: ["revive-self"],
    },
    {
      id: "taros_engraving",
      type: "engraving",
      name: "Taros's Engraving",
      description:
        "The healing amount of Divine Shield skill increases by 35% of max HP. When attacked, there is a 50% chance of ATK and DEF increasing by 6% each. (Stacks up to 6 times)",
      tags: ["increase-self-attack"],
    },
  ],
};
