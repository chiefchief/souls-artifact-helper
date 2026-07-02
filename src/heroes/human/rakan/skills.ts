import { heroImageUrl, type Hero } from "../../types";
export const rakan: Hero = {
  id: "rakan",
  name: "Rakan",
  rarity: "epic",
  race: "human",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("human", "rakan"),
  skills: [
    {
      id: "rakan_overwhelming_attack",
      type: "active",
      name: "Overwhelming Attack",
      description:
        "Deal ATK 210% damage to 1 enemy and apply a Shield to yourself equal to 90% of the damage dealt for 2 turn(s).",
      tags: ["shield"],
    },
    {
      id: "rakan_strongest_warrior",
      type: "passive",
      name: "Strongest Warrior",
      description:
        "When your HP is over 50%, DEF increases by 30%, and when your HP is below 50%, ATK increases by 30%.",
      tags: ["increase-self-attack", "increase-self-defense"],
    },
    {
      id: "rakan_wounded_spirit",
      type: "passive",
      name: "Wounded Spirit",
      description:
        "Upon death, apply a Silence debuff for 1 turn(s) to all enemies with 40 or more Energy. (once per battle)\n※ Silenced enemies cannot gain Energy from attacking or being attacked, and they are not able to use their active skills.",
      statBonus: [{ stat: "dodge_rate", value: 40 }],
      tags: ["silence"],
    },
    {
      id: "rakan_berserker_rage",
      type: "passive",
      name: "Berserker Rage",
      description:
        "At the end of every 2 round(s), remove 2 debuff(s) from yourself and all allies in the same row. Upon removing a debuff, heal yourself for 20% of max HP. (once per round)",
      tags: ["heal-self", "remove-ally-debuff"],
    },
    {
      id: "rakan_vigor",
      type: "awaken",
      name: "Vigor",
      description:
        "Upon death, reduce the Energy of all enemies by 60 and apply a debuff that increases Damage Taken by 28% for 2 turn(s). (2 times per combat)",
      tags: ["increase-damage-taken", "reduce-energy"],
    },
    {
      id: "rakan_engraving",
      type: "engraving",
      name: "Rakan's Engraving",
      description:
        "When an ally dies, you have a 70% chance to take revenge on the enemy that defeated the ally. The enemy will be Silenced for 2 turns.",
      tags: ["silence"],
    },
  ],
};
