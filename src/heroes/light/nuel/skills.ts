import { heroImageUrl, type Hero } from "../../types";
export const nuel: Hero = {
  id: "nuel",
  name: "Nuel",
  rarity: "epic",
  race: "light",
  role: "supporter",
  attribute: "agility",
  imageUrl: heroImageUrl("light", "nuel"),
  skills: [
    {
      id: "nuel_barrage_of_light",
      type: "active",
      name: "Barrage of Light",
      description:
        "Each of 3 weapons deals ATK 100% damage to random enemy, and reduce their Energy by 25. (Nuel starts with full Energy)",
      tags: ["reduce-attack", "reduce-energy"],
    },
    {
      id: "nuel_divine_punishment",
      type: "passive",
      name: "Divine Punishment",
      description: "ATK of normal attack increases by 50%.",
      statBonus: [
        { stat: "pen", value: 8 },
        { stat: "crit_def", value: 15 },
      ],
      tags: [],
    },
    {
      id: "nuel_divine_power",
      type: "passive",
      name: "Divine Power",
      description: "At the start of battle, increase the Energy of all allies by 50.",
      tags: ["give-energy"],
    },
    {
      id: "nuel_strong_heart",
      type: "passive",
      name: "Strong Heart",
      description: "At the end of every 1 round(s), remove 1 debuff(s) from yourself.",
      statBonus: [
        { stat: "dodge_rate", value: 15 },
        { stat: "mres", value: 15 },
      ],
      tags: ["remove-ally-debuff"],
    },
    {
      id: "nuel_flash_of_light",
      type: "awaken",
      name: "Flash of Light",
      description:
        "If HP falls below 40%, gain a shield of 60% of max HP for 1 turn and apply a HoT buff to yourself, healing for 80% of ATK for 3 turn(s). (once per battle)",
      tags: ["healing-over-time", "shield"],
    },
    {
      id: "nuel_engraving",
      type: "engraving",
      name: "Nuel's Engraving",
      description:
        "Increase ATK against intelligence-type enemies by 20%. Whenever an ally dies, all allies gain 30 energy.",
      tags: ["give-energy"],
    },
  ],
};
