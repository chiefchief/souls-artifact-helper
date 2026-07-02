import { heroImageUrl, type Hero } from "../../types";
export const zenon: Hero = {
  id: "zenon",
  name: "Zenon",
  rarity: "epic",
  race: "undead",
  role: "supporter",
  attribute: "strength",
  imageUrl: heroImageUrl("undead", "zenon"),
  skills: [
    {
      id: "zenon_chain_hook",
      type: "active",
      name: "Chain Hook",
      description:
        "Deal ATK 160% damage to all enemies in the front row and apply a debuff that reduces Healing Received by 80% for 2 turn(s).",
      tags: ["reduce-healing-received"],
    },
    {
      id: "zenon_soul_scar",
      type: "passive",
      name: "Soul Scar",
      description: "The closer you are to the enemy, the higher ATK increases. (max 25%)",
      tags: [],
    },
    {
      id: "zenon_restraining_chain",
      type: "passive",
      name: "Restraining Chain",
      description:
        "Starting from round 2 and every 3 rounds thereafter, Restraint 1 enemy in the 2nd to 3rd rows, closest to you, for 1 turn.",
      statBonus: [
        { stat: "hp", value: 10 },
        { stat: "mres", value: 15 },
      ],
      tags: [],
    },
    {
      id: "zenon_wailing_soul",
      type: "passive",
      name: "Wailing Soul",
      description: "Reduce the Damage Taken of yourself and adjacent allies behind by 20%.",
      tags: [],
    },
    {
      id: "zenon_absorb_soul",
      type: "awaken",
      name: "Absorb Soul",
      description:
        "Upon death, apply a debuff to all enemies that reduces Healing Received by 90% for 2 turn(s). (once per battle)",
      tags: ["reduce-healing-received"],
    },
    {
      id: "zenon_engraving",
      type: "engraving",
      name: "Zenon's Engraving",
      description:
        "Active Skill removes 1 buff from the enemy. When a buff is removed, you have a 50% chance of applying Restraint on them for 1 turn.",
      tags: ["remove-enemy-buff"],
    },
    {
      id: "zenon_sturdy_chains",
      type: "exclusive-equipment",
      name: "Sturdy Chains",
      description:
        "When Zenon uses an active skill, the ally with the highest ATK gains +25% ATK for 2 turns. (Once per round)\nIf the active skill removes two or more enemy buffs at once, he will use the active skill again. (Once per round)",
      tags: ["remove-enemy-buff"],
    },
  ],
};
