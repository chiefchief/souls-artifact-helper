import { heroImageUrl, type Hero } from "../../types";

export const feruki: Hero = {
  id: "feruki",
  name: "Feruki",
  rarity: "epic",
  race: "darkness",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("darkness", "feruki"),
  skills: [
    {
      id: "feruki_intimidating_gaze",
      type: "active",
      name: "Intimidating Gaze",
      description:
        "Restores 30% of Max HP and gains Intimidating buff for 1 turn. Additionally, has a 60% chance to remove 2 debuff(s) from self.\n※ Enemy heroes can only attack the hero with Intimidating. Intimidating takes priority over Provoke, and does not affect enemy heroes immune to Provoke.",
      tags: ["taunt", "heal-self", "remove-self-debuff"],
    },
    {
      id: "feruki_shield_slam",
      type: "passive",
      name: "Shield Slam",
      description: "Attacks the enemy with the highest Energy, with a 70% chance to inflict Silence for 1 turn.",
      tags: ["silence"],
    },
    {
      id: "feruki_little_vanguard",
      type: "passive",
      name: "Little Vanguard",
      description:
        "At the start of every 2 rounds, applies a 25% damage reduction buff to self and the ally with the lowest HP for 1 turn.",
      tags: ["damage-reduction"],
      statBonus: [{ stat: "hp", value: 20 }],
    },
    {
      id: "feruki_life_exchange",
      type: "passive",
      name: "Life Exchange",
      description: "When an allied hero's HP falls to 50% or below, increases own Energy by 25. (Once per ally)",
      tags: ["gain-energy"],
    },
    {
      id: "feruki_abyssal_eye",
      type: "awaken",
      name: "Abyssal Eye",
      description:
        "When Feruki has the Intimidating buff, the following effect activates:\nFeruki's DEF increases by 60%.\nAdditionally, when hit by an Active Skill or Normal Attack, recovers HP equal to 30% of the damage taken. (Healing cannot exceed 100% of Feruki's DEF.)",
      tags: ["increase-self-defense", "heal-self"],
    },
    {
      id: "feruki_engraving",
      type: "engraving",
      name: "Feruki's Engraving",
      description: "When Feruki is hit by an Active Skill, she reflects damage equal to 80% of her DEF.",
      tags: ["reflect-damage"],
    },
  ],
};
