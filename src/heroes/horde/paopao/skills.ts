import { heroImageUrl, type Hero } from "../../types";
export const paopao: Hero = {
  id: "paopao",
  name: "Paopao",
  rarity: "epic",
  race: "horde",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("horde", "paopao"),
  skills: [
    {
      id: "paopao_drinks_only_dew",
      type: "active",
      name: "Drinks Only Dew",
      description:
        "Restores self by 30% of max HP and gains the Reflective Qi buff for 2 turns. (Reduces damage taken by 20%, and instantly reflects 35% of direct attack damage received back to the attacker. Damage can be reflected to enemies in Transparent or Shadow states, and damage shared through damage distribution is also reflected to the attacker.)",
      tags: ["heal-self", "damage-reduction", "reflect-damage"],
    },
    {
      id: "paopao_threat_apprehension",
      type: "passive",
      name: "Threat Apprehension",
      description:
        "Normal attacks deal damage of 140% ATK to 1 enemy with high energy. Additionally, if the target's energy is higher than 90%, reduce their energy by 25.",
      tags: ["reduce-energy"],
    },
    {
      id: "paopao_damage_sharing",
      type: "passive",
      name: "Damage Sharing",
      description:
        "If an ally with the lowest HP, excluding myself, receive damage from a direct attack, share 50% of the damage.",
      tags: ["damage-reduction"],
    },
    {
      id: "paopao_big_belly",
      type: "passive",
      name: "Big Belly",
      description:
        "When Paopao heals himself, 100% of the amount healed that exceeds his max HP will be converted to a protective shield that lasts for 2 turn(s).",
      statBonus: [
        { stat: "hp", value: 10 },
        { stat: "def", value: 25 },
      ],
      tags: ["shield"],
    },
    {
      id: "paopao_stored_vitality",
      type: "awaken",
      name: "Stored Vitality",
      description: "Until round 5, at the start of each round, if HP is below 60%, heal yourself by 25% of max HP.",
      tags: ["heal-self"],
    },
    {
      id: "paopao_engraving",
      type: "engraving",
      name: "Paopao's Engraving",
      description:
        "Just before death, remove all debuffs on you and gain a Shield equal to 60% of max HP for 2 turn(s) and survive. Gain an additional 100 Energy. (once per battle)",
      tags: ["survive", "shield", "gain-energy", "remove-self-debuff"],
    },
  ],
};
