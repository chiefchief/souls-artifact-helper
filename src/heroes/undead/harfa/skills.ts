import { heroImageUrl, type Hero } from "../../types";
export const harfa: Hero = {
  id: "harfa",
  name: "Harfa",
  rarity: "epic",
  race: "undead",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("undead", "harfa"),
  skills: [
    {
      id: "harfa_destructive_charm",
      type: "active",
      name: "Destructive Charm",
      description:
        "Deal ATK 160% damage to all enemies in the front row, and have a 70% chance to apply a Silence debuff for 1 turn(s).\n※ Silenced enemies cannot gain Energy from attacking or being attacked, and they are not able to use their active skills.",
      tags: ["silence"],
    },
    {
      id: "harfa_vicious_cut",
      type: "passive",
      name: "Vicious Cut",
      description: "Reduce the enemy's Energy by 40 on normal attack.",
      statBonus: [{ stat: "cc_res", value: 80 }],
      tags: ["reduce-energy"],
    },
    {
      id: "harfa_royal_grandeur",
      type: "passive",
      name: "Royal Grandeur",
      description: "When receiving a magical attack, gain an additional 40 Energy.",
      statBonus: [{ stat: "mres", value: 40 }],
      tags: ["gain-energy"],
    },
    {
      id: "harfa_vampiric_blade",
      type: "passive",
      name: "Vampiric Blade",
      description:
        "Upon death (activates even during an enemy's continuous attack), heal all allies by 15% of their max HP, and apply a buff that reduces Damage Taken by 22% for 2 turn(s). (once per battle)",
      tags: ["damage-reduction", "heal-allies"],
    },
    {
      id: "harfa_king_of_the_dead",
      type: "awaken",
      name: "King of the Dead",
      description: "Upon death, revive after 2 round(s) with 70% HP and 100% Energy. (once per battle)",
      tags: ["revive-self"],
    },
    {
      id: "harfa_engraving",
      type: "engraving",
      name: "Harfa's Engraving",
      description: "Increase ATK by 25% and DEF by 32% whenever you are resurrected. (Stacks up to 3 times)",
      tags: ["increase-self-attack"],
    },
  ],
};
