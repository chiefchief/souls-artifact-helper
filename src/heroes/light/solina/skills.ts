import { heroImageUrl, type Hero } from "../../types";
export const solina: Hero = {
  id: "solina",
  name: "Solina",
  rarity: "epic",
  race: "light",
  role: "healer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("light", "solina"),
  skills: [
    {
      id: "solina_prayer_of_healing",
      type: "active",
      name: "Prayer of Healing",
      description:
        "Heal 2 allies with low HP by ATK 155%, and apply them a Shield equal to 20% of their max HP for 2 turn(s). Additionally, remove all debuffs from them. (The Shield cannot exceed 150% of Solina's ATK)",
      tags: ["anti-shield", "heal-allies", "remove-ally-debuff", "shield"],
    },
    {
      id: "solina_ultimate_sacrifice",
      type: "passive",
      name: "Ultimate Sacrifice",
      description: "At the start of battle, permanently increase the Speed of all allies by 20.",
      tags: ["increase-allies-speed"],
    },
    {
      id: "solina_pillar_of_light",
      type: "passive",
      name: "Pillar of Light",
      description: "If your HP falls below 35%, heal yourself by 30% of max HP. (once per battle)",
      statBonus: [{ stat: "dodge_rate", value: 25 }],
      tags: ["heal-self"],
    },
    {
      id: "solina_unfailing_faith",
      type: "passive",
      name: "Unfailing Faith",
      description: "If an ally's HP falls below 50%, you gain 50 Energy. (once per ally)",
      tags: ["gain-energy"],
    },
    {
      id: "solina_divine_miracle",
      type: "awaken",
      name: "Divine Miracle",
      description:
        "When using an active skill, revive 1x random dead ally with 80% HP and 100% Energy. (1 time(s) per battle)",
      tags: ["revive-ally"],
    },
    {
      id: "solina_engraving",
      type: "engraving",
      name: "Solina's Engraving",
      description: "Upon death, resurrect 1 random fallen ally with 70% of their HP and 100 energy. (Once per battle)",
      tags: ["revive-ally"],
    },
  ],
};
