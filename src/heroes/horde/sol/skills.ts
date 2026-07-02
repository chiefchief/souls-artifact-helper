import { heroImageUrl, type Hero } from "../../types";
export const sol: Hero = {
  id: "sol",
  name: "Sol",
  rarity: "epic",
  race: "horde",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("horde", "sol"),
  skills: [
    {
      id: "sol_rain_of_fire",
      type: "active",
      name: "Rain of Fire",
      description: "Deal ATK 81% damage to all enemies and inflict Burn, dealing ATK 48% DoT for 2 turns.",
      tags: ["apply-dot"],
    },
    {
      id: "sol_destructive_arrow",
      type: "passive",
      name: "Destructive Arrow",
      description: "Normal attack deals ATK 98% damage to all enemies in the front row.",
      statBonus: [{ stat: "pen", value: 15 }],
      tags: [],
    },
    {
      id: "sol_unyielding_perseverance",
      type: "passive",
      name: "Unyielding Perseverance",
      description: "Heal yourself by 50% of all Burn damage dealt to enemies.",
      statBonus: [{ stat: "pres", value: 10 }],
      tags: ["heal-self"],
    },
    {
      id: "sol_peerless_hunter",
      type: "passive",
      name: "Peerless Hunter",
      description: "If there are more than 4 enemies in the Burn state at the end of each round, gain 30 Energy.",
      tags: ["gain-energy"],
    },
    {
      id: "sol_raptor_guardian",
      type: "awaken",
      name: "Raptor Guardian",
      description:
        "Inflict Burn on 1 random enemy, dealing ATK 60% DoT for 3 turn(s) at the start of every 2 round(s).",
      tags: ["apply-dot"],
    },
    {
      id: "sol_engraving",
      type: "engraving",
      name: "Sol's Engraving",
      description: "Apply Burn to all enemies upon death, and deal DoT of 50% ATK for 2 turns.",
      tags: ["apply-dot"],
    },
    {
      id: "sol_ignis",
      type: "exclusive-equipment",
      name: "Ignis",
      description:
        "When Sol or an adjacent ally or Horde hero attacks a Burning enemy hero with an active skill or normal attack, there is a 60% chance to inflict Burn, dealing 48% of ATK as damage over time for 2 turn(s). (Excludes bosses)\nFor each Burn effect on an enemy hero, their healing received is reduced by 20%. If the enemy has 3 or more Burns, their Physical Resistance is reduced by 30. (Excludes bosses, healing reduction capped at 80%)",
      tags: ["apply-dot", "reduce-healing-received", "reduce-pres"],
    },
  ],
};
