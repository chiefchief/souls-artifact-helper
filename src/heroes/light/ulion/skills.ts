import { heroImageUrl, type Hero } from "../../types";
export const ulion: Hero = {
  id: "ulion",
  name: "Ulion",
  rarity: "epic",
  race: "light",
  role: "dealer",
  attribute: "strength",
  imageUrl: heroImageUrl("light", "ulion"),
  skills: [
    {
      id: "ulion_holy_shock",
      type: "active",
      name: "Holy Shock",
      description:
        "Deal ATK 230% damage to the enemy with the highest ATK and put it in the Shock state for 1 turn(s).",
      tags: ["cc"],
    },
    {
      id: "ulion_ray_of_light",
      type: "passive",
      name: "Ray of Light",
      description:
        "ATK of normal attack increases by 55%, and heal yourself by 70% of the damage dealt on your normal attack.",
      statBonus: [{ stat: "pres", value: 15 }],
      tags: ["heal-self"],
    },
    {
      id: "ulion_aura_of_concentration",
      type: "passive",
      name: "Aura of Concentration",
      description: "Gain 100 Energy at the start of battle. Then, every 2 round(s), gain 25 Energy.",
      tags: ["gain-energy"],
    },
    {
      id: "ulion_synergy",
      type: "passive",
      name: "Synergy",
      description:
        "At the start of the battle, permanently increase the Accuracy of yourself and adjacent allies by 40%.",
      tags: ["increase-self-accuracy", "increase-allies-accuracy"],
    },
    {
      id: "ulion_holy_energy",
      type: "awaken",
      name: "Holy Energy",
      description: "When you kill an enemy, you heal yourself by 50% of max HP.",
      statBonus: [
        { stat: "atk", value: 15 },
        { stat: "crit_rate", value: 15 },
      ],
      tags: ["heal-self"],
    },
    {
      id: "ulion_engraving",
      type: "engraving",
      name: "Ulion's Engraving",
      description:
        "When HP is below 50%, ATK increases by 25%. Normal attacks have a 65% chance to inflict Shock on the enemy for 1 turn.",
      tags: ["cc"],
    },
    {
      id: "ulion_thunder",
      type: "exclusive-equipment",
      name: "Thunder",
      description:
        "Increases the duration of the Active Skill's Shock effect by 1 turns.\nWhen attacking enemies in Shock, removes 1 buff(s) and has a 100% chance to ignore effects that prevent damage from exceeding a certain percentage of max HP. (This effect does not apply to additional attacks made in the same turn the Shock was applied.)",
      tags: ["damage-cap", "remove-enemy-buff"],
    },
  ],
};
