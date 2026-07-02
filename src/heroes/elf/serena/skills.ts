import { heroImageUrl, type Hero } from "../../types";
export const serena: Hero = {
  id: "serena",
  name: "Serena",
  rarity: "epic",
  race: "elf",
  role: "dealer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("elf", "serena"),
  skills: [
    {
      id: "serena_spiral_blow",
      type: "active",
      name: "Spiral Blow",
      description:
        "Deal 220% ATK damage to the enemy with the highest Crit Rate and inflict the Fog debuff for 2 turns. Enemies affected by Fog debuff have their ATK reduced by 20% and Crit Rate reduced by 10%. (Fog debuff effects do not stack.)",
      tags: ["reduce-attack", "reduce-crit-rate"],
    },
    {
      id: "serena_ocean_hunt",
      type: "passive",
      name: "Ocean Hunt",
      description:
        "Normal Attack damage is increased by 20%. Prioritizes attacking enemies affected by the Fog debuff.",
      statBonus: [{ stat: "pen", value: 20 }],
      tags: [],
    },
    {
      id: "serena_song_of_the_tides",
      type: "passive",
      name: "Song of the Tides",
      description:
        "Until round 3, when Serena uses a Normal Attack or Active Skill, she grants a shield equal to 50% of the damage dealt to the ally with the lowest HP for 1 turn.",
      tags: ["shield"],
    },
    {
      id: "serena_sirens_gaze",
      type: "passive",
      name: "Siren's gaze",
      description: "When Serena uses an Active Skill, she has a 100% chance to remove 1 buff from the target.",
      tags: ["remove-enemy-buff"],
    },
    {
      id: "serena_wave_strike",
      type: "awaken",
      name: "Wave Strike",
      description:
        "When Serena attacks an enemy affected by the Fog debuff, the following effect activates.\nAttacks permanently reduces the target's Crit Damage by 15%. This effect does not apply to boss-type enemies. (Up to 2 times per target)\nWhen using an Active Skill, deals additional damage equal to 5% of the target's Max HP per debuff on the target. (Additional damage capped at 25%)",
      tags: ["damage-cap", "reduce-crit-damage"],
    },
    {
      id: "serena_engraving",
      type: "engraving",
      name: "Serena's Engraving",
      description:
        "When Serena attacks with an Active Skill, her ATK increases by 10% per debuff on the target. (ATK increases up to 50%)\nCrit Rate of enemies affected by Fog is further reduced by 30%.",
      tags: ["reduce-crit-rate"],
    },
  ],
};
