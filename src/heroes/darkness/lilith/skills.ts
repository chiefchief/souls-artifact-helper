import { heroImageUrl, type Hero } from "../../types";
export const lilith: Hero = {
  id: "lilith",
  name: "Lilith",
  rarity: "epic",
  race: "darkness",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("darkness", "lilith"),
  skills: [
    {
      id: "lilith_darkness_slash",
      type: "active",
      name: "Darkness Slash",
      description:
        "Deal ATK 180% damage to all enemies in the front row and absorb 50% of their Energy. When your Energy becomes full due to the absorbed Energy, use the active skill again.",
      tags: ["absorb-energy", "repeat-attack"],
    },
    {
      id: "lilith_mutilate",
      type: "passive",
      name: "Mutilate",
      description: "When you dodge, reduce the enemy attacker's Energy by 30.",
      statBonus: [{ stat: "dodge_rate", value: 55 }],
      tags: ["reduce-energy"],
    },
    {
      id: "lilith_ambush",
      type: "passive",
      name: "Ambush",
      description: "When attacking with HP below 35%, heal yourself by 50% of the damage dealt.",
      tags: ["heal-self"],
    },
    {
      id: "lilith_mocking_laugh",
      type: "passive",
      name: "Mocking Laugh",
      description:
        "If all allies are killed and you are the last one standing, gain a buff that increases Dodge Rate by 46% for 2 turn(s).",
      tags: ["increase-self-dodge"],
    },
    {
      id: "lilith_demonic_leech",
      type: "awaken",
      name: "Demonic Leech",
      description:
        "When you kill an enemy, your ATK increase by 15% of the killed enemy's ATK and your DEF by 20% of the killed enemy's DEF.",
      tags: [],
    },
    {
      id: "lilith_engraving",
      type: "engraving",
      name: "Lilith's Engraving",
      description:
        "Upon dodging, you have a 50% chance of launching counterattack against the attacker and dealing damage of 100% ATK. You gain 30 energy upon launching counterattack.",
      tags: ["counter-attack", "gain-energy"],
    },
  ],
};
