import { heroImageUrl, type Hero } from "../../types";
export const aolmond: Hero = {
  id: "aolmond",
  name: "Aolmond",
  rarity: "epic",
  race: "elf",
  role: "healer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("elf", "aolmond"),
  skills: [
    {
      id: "aolmond_lunar_owl",
      type: "active",
      name: "Lunar Owl",
      description:
        "Heal yourself and adjacent allies by 75% of your ATK, and apply a HoT buff, healing for 60% of your ATK for 3 turn(s).",
      tags: ["heal-allies", "heal-self", "healing-over-time"],
    },
    {
      id: "aolmond_spirit_release",
      type: "passive",
      name: "Spirit Release",
      description: "Gain 100 Energy at the start of battle.",
      tags: ["gain-energy"],
    },
    {
      id: "aolmond_warm_heart",
      type: "passive",
      name: "Warm Heart",
      description:
        "At the end of odd-numbered rounds, remove 2 debuff(s) from yourself and adjacent allies, and apply a buff that increases Healing Received by 20% for 1 turn(s).",
      tags: ["increase-healing-received", "remove-ally-debuff"],
    },
    {
      id: "aolmond_inspiring_touch",
      type: "passive",
      name: "Inspiring Touch",
      description:
        "At the start of every 2 round(s), apply a HoT buff to the ally with the lowest HP, healing for 40% of your ATK for 2 turn(s).",
      statBonus: [{ stat: "def", value: 15 }],
      tags: ["heal-allies", "healing-over-time"],
    },
    {
      id: "aolmond_amplified_nature",
      type: "awaken",
      name: "Amplified Nature",
      description: "Whenever an ally uses an active skill, Aolmond's healing amount increases by 4.5%. (max 15 stacks)",
      tags: [],
    },
    {
      id: "aolmond_engraving",
      type: "engraving",
      name: "Aolmond's Engraving",
      description:
        "When you have more than 3 adjacent allies, Physical Resistance increase by 20%, and damage of normal attacks increases by 50%.",
      tags: ["increase-allies-defense"],
    },
    {
      id: "aolmond_forest_moon_owl",
      type: "exclusive-equipment",
      name: "Forest Moon Owl",
      description:
        "When using Active Skill, if the target has continuous healing, grants a shield equal to 20% of own max HP for 2 turns. (Once per round)",
      statBonus: [{ stat: "hp", value: 15 }],
      tags: ["healing-over-time", "shield"],
    },
  ],
};
