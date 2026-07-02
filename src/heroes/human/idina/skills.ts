import { heroImageUrl, type Hero } from "../../types";
export const idina: Hero = {
  id: "idina",
  name: "Idina",
  rarity: "epic",
  race: "human",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("human", "idina"),
  skills: [
    {
      id: "idina_ice_wall",
      type: "active",
      name: "Ice Wall",
      description: "Deal ATK 100% damage to all enemies in the back row and Freeze them for 1 turn at a 65% chance.",
      tags: ["cc"],
    },
    {
      id: "idina_ice_crystal",
      type: "passive",
      name: "Ice Crystal",
      description: "Normal attack deals ATK 83% damage to all enemies in the back row.",
      statBonus: [{ stat: "hp", value: 12 }],
      tags: [],
    },
    {
      id: "idina_ice_queen",
      type: "passive",
      name: "Ice Queen",
      description: "If attacked by a magical attack, gain an additional 25 Energy.",
      tags: ["gain-energy"],
    },
    {
      id: "idina_frozen",
      type: "passive",
      name: "Frozen",
      description: "If your HP falls below 30% or 70% Freeze the enemy attacker for 1 turn. (once per battle)",
      statBonus: [{ stat: "mres", value: 10 }],
      tags: ["cc"],
    },
    {
      id: "idina_icy_grasp",
      type: "awaken",
      name: "Icy Grasp",
      description:
        "At the start of every 3 round(s), Freeze 1 random enemy in the back row for 1 turn and reduce its Energy by 30.",
      tags: ["reduce-energy"],
    },
    {
      id: "idina_engraving",
      type: "engraving",
      name: "Idina's Engraving",
      description:
        "When attacking Frozen enemies, the enemy's ATK decreases by 9% permanently, while increase your own ATK by the same amount.",
      tags: [],
    },
  ],
};
