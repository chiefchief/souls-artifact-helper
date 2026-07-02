import { heroImageUrl, type Hero } from "../../types";
export const lulu: Hero = {
  id: "lulu",
  name: "LuLu",
  rarity: "epic",
  race: "elf",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("elf", "lulu"),
  skills: [
    {
      id: "lulu_victory_performance",
      type: "active",
      name: "Victory Performance",
      description:
        "Increase the Energy of all allies by 50, and apply a buff to them that increases their ATK by 20% for 2 turn(s).",
      tags: ["give-energy", "increase-allies-attack"],
    },
    {
      id: "lulu_magic_arrow",
      type: "passive",
      name: "Magic Arrow",
      description:
        "Normal attack deals ATK 103% damage to all enemies in the front row, and it heals the ally with the lowest HP by 50% of the damage dealt.",
      tags: ["heal-allies"],
    },
    {
      id: "lulu_inner_rage",
      type: "passive",
      name: "Inner Rage",
      description: "Whenever an ally dies, increase the Energy of all allies by 40. (5 time(s) per battle)",
      statBonus: [{ stat: "def", value: 15 }],
      tags: ["give-energy"],
    },
    {
      id: "lulu_soothing_light",
      type: "passive",
      name: "Soothing Light",
      description:
        "At the start of round 2, apply a Shield to the ally with the highest ATK, equal to 160% of your ATK for 3 turn(s).",
      tags: ["shield"],
    },
    {
      id: "lulu_harp_player",
      type: "awaken",
      name: "Harp Player",
      description:
        "Upon death, increase the Energy of all allies by 60, and apply a buff to them that increases ATK by 15% for 2 turn(s). (once per battle)",
      tags: ["give-energy", "increase-allies-attack"],
    },
    {
      id: "lulu_engraving",
      type: "engraving",
      name: "Lulu's Engraving",
      description:
        "When attacked, you have a 50% chance of permanently reducing the Speed of the enemy that attacked you by 5, and apply a 20% ATK reduction debuff for 1 turns.",
      tags: ["reduce-attack", "reduce-enemy-speed"],
    },
  ],
};
