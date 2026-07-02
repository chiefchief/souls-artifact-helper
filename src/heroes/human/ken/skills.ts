import { heroImageUrl, type Hero } from "../../types";
export const ken: Hero = {
  id: "ken",
  name: "Ken",
  rarity: "epic",
  race: "human",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("human", "ken"),
  skills: [
    {
      id: "ken_chain_shuriken",
      type: "active",
      name: "Chain Shuriken",
      description:
        "Deal ATK 145% damage to adjacent enemies in a chain attack. This attack can be chained up to 4 times.",
      tags: [],
    },
    {
      id: "ken_assassination_blade",
      type: "passive",
      name: "Assassination Blade",
      description: "All (normal, active) attacks inflict Bleeding on the enemy, dealing ATK 40% DoT for 2 turn(s).",
      tags: ["apply-dot"],
    },
    {
      id: "ken_silent_assassin",
      type: "passive",
      name: "Silent Assassin",
      description: "ATK increases by 15% for each bleeding enemy.",
      statBonus: [{ stat: "dodge_rate", value: 10 }],
      tags: ["increase-self-attack"],
    },
    {
      id: "ken_gathering_shadow",
      type: "passive",
      name: "Gathering Shadow",
      description: "Dodge Rate increases by 10% at the start of every 2 round(s). (max 5 stacks)",
      tags: ["increase-self-dodge"],
    },
    {
      id: "ken_repeated_strikes",
      type: "awaken",
      name: "Repeated Strikes",
      description:
        "Normal attack targets 1 additional enemy in the Bleeding state. ATK of normal attack increases by 23%",
      tags: [],
    },
    {
      id: "ken_engraving",
      type: "engraving",
      name: "Ken's Engraving",
      description: "Increase ATK against bleeding enemies by 20%, and recover HP by 22% of damage dealt.",
      tags: ["heal-self"],
    },
  ],
};
