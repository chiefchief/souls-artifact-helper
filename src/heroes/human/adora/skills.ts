import { heroImageUrl, type Hero } from "../../types";
export const adora: Hero = {
  id: "adora",
  name: "Adora",
  rarity: "epic",
  race: "human",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("human", "adora"),
  skills: [
    {
      id: "adora_cursed_puppet",
      type: "active",
      name: "Cursed Puppet",
      description:
        "Deal damage (170% of ATK) to enemy directly opposite you (if the space directly opposite you is empty, then to the default target), and turn them into a puppet and applying Crowd Control on them for 1 turn(s).",
      tags: ["cc"],
    },
    {
      id: "adora_shadows_of_silence",
      type: "passive",
      name: "Shadows of Silence",
      description:
        "Deal damage (135% of ATK) to enemy directly opposite you (if the space directly opposite you is empty, then to the default target), and have a 50% chance of applying Silence for 1 turn(s).",
      tags: ["silence"],
    },
    {
      id: "adora_darkness_eating",
      type: "passive",
      name: "Darkness Eating",
      description: "At the end of the round, remove 2 DoT debuff(s) from 3 allies.",
      statBonus: [{ stat: "pres", value: 15 }],
      tags: ["remove-ally-debuff", "remove-dot"],
    },
    {
      id: "adora_precious_friend",
      type: "passive",
      name: "Precious Friend",
      description: "Upon Normal Attacks, obtain a Shield with 80% of damage dealt that lasts for 2 turn(s).",
      tags: [],
    },
    {
      id: "adora_vitality_recovery",
      type: "awaken",
      name: "Vitality Recovery",
      description: "When removing DoT, Heal that Hero by 30% of max HP, and increase DEF by 25% for 2 turn(s).",
      tags: ["heal-allies", "increase-self-defense", "remove-dot"],
    },
    {
      id: "adora_engraving",
      type: "engraving",
      name: "Adora's Engraving",
      description:
        "Reduce Energy Gain Rate of enemy that have become puppet and adjacent enemies by 50%, and increase duration of Puppet by 1 turn.",
      tags: ["reduce-energy-gain"],
    },
    {
      id: "adora_exclusive_equipment",
      type: "exclusive-equipment",
      name: "Soulbound Doll",
      description:
        "When using Active Skill, 50% chance to turn the target and one adjacent enemy into a Puppet for 2 turns. Enemies afflicted by Adora's Puppet debuff take 20% more damage. Additionally, when an enemy under the Puppet effect dies, Adora gains 50 Energy. (Energy gain triggers up to 2 times per battle)",
      tags: ["gain-energy", "increase-damage-taken"],
    },
  ],
};
