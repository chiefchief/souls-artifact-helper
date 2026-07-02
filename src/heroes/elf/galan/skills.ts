import { heroImageUrl, type Hero } from "../../types";
export const galan: Hero = {
  id: "galan",
  name: "Galan",
  rarity: "epic",
  race: "elf",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("elf", "galan"),
  skills: [
    {
      id: "galan_desert_tornado",
      type: "active",
      name: "Desert Tornado",
      description:
        "Deal ATK 110% damage to the nearest enemy in the back row and all adjacent enemies to it, and apply a Sandstorm for 1 turn at a 55% chance.",
      tags: ["cc"],
    },
    {
      id: "galan_shackling_wind",
      type: "passive",
      name: "Shackling Wind",
      description: "Normal attack deals ATK 120% damage to the nearest enemy in the back row.",
      statBonus: [{ stat: "hp", value: 15 }],
      tags: [],
    },
    {
      id: "galan_hidden_fervor",
      type: "passive",
      name: "Hidden Fervor",
      description: "At the start of each 2 rounds, reduce the Energy of the nearest enemy in the back row by 25.",
      statBonus: [
        { stat: "mres", value: 10 },
        { stat: "crit_def", value: 10 },
      ],
      tags: ["reduce-energy"],
    },
    {
      id: "galan_reticence",
      type: "passive",
      name: "Reticence",
      description: "ATK increases by 12% for each enemy in the Sandstorm state.",
      tags: [],
    },
    {
      id: "galan_guardian_of_nature",
      type: "awaken",
      name: "Guardian of Nature",
      description: "The chance of a Sandstorm increases by 10%, and ATK of an active skill increases by 20%.",
      tags: [],
    },
    {
      id: "galan_engraving",
      type: "engraving",
      name: "Galan's Engraving",
      description:
        "Increase ATK by 25% against enemies afflicted with Sandstorm. When using normal attack on enemies afflicted with Sandstorm, you have a 60% chance of increasing the duration of Sandstorm by 1 turn.",
      tags: [],
    },
  ],
};
