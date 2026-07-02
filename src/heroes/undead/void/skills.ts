import { heroImageUrl, type Hero } from "../../types";
export const voidHero: Hero = {
  id: "void",
  name: "Void",
  rarity: "epic",
  race: "undead",
  role: "healer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("undead", "void"),
  skills: [
    {
      id: "void_chain_of_blood",
      type: "active",
      name: "Chain of Blood",
      description: "Deal ATK 190% damage to 1 enemy and heal all allies by 70% of the damage dealt.",
      tags: ["heal-allies"],
    },
    {
      id: "void_bloodsucking_talisman",
      type: "passive",
      name: "Bloodsucking Talisman",
      description:
        "At the start of battle, apply a buff to the ally with the highest max HP, increasing its Lifesteal Rate by 140% for 1 turn(s). From round 2 onwards, each round apply a buff to the ally with the lowest HP, increasing its Lifesteal Rate by 80% for 2 turn(s).",
      tags: ["increase-allies-lifesteal"],
    },
    {
      id: "void_game_of_death",
      type: "passive",
      name: "Game of Death",
      description: "At the start of each round, release 2x ally under CC.",
      statBonus: [{ stat: "cc_res", value: 100 }],
      tags: [],
    },
    {
      id: "void_mania",
      type: "passive",
      name: "Mania",
      description:
        "At the start of each round, reduce the Speed of the enemy with the highest ATK by 20 for 1 turn(s).",
      statBonus: [{ stat: "speed", value: 30 }],
      tags: ["reduce-attack"],
    },
    {
      id: "void_death_magic",
      type: "awaken",
      name: "Death Magic",
      description:
        "Enemies killed by Void cannot be revived. When an ally dies, apply a buff that reduces Damage Taken by 25% for 2 turn(s) to the ally with the lowest HP and yourself.",
      tags: ["damage-reduction", "prevent-revive"],
    },
    {
      id: "void_engraving",
      type: "engraving",
      name: "Void's Engraving",
      description:
        "Heal by 20% of max HP whenever an enemy dies. Whenever an ally dies, apply a Lifesteal Rate 32% increase buff to all remaining allies for 1 turns.",
      tags: ["heal-self", "increase-allies-lifesteal"],
    },
    {
      id: "void_thanato_nomicon",
      type: "exclusive-equipment",
      name: "Thanato-nomicon",
      description:
        "Void gains 50 energy when performing a normal attack on a Strength-type target. Additionally, penetration increases by 70% when attacking Strength-type heroes and removes all shields including immunity shields.",
      tags: ["anti-shield", "gain-energy", "increase-self-penetration"],
    },
  ],
};
