import { heroImageUrl, type Hero } from "../../types";
export const karim: Hero = {
  id: "karim",
  name: "Karim",
  rarity: "epic",
  race: "human",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("human", "karim"),
  skills: [
    {
      id: "karim_chain_slash",
      type: "active",
      name: "Chain Slash",
      description:
        "Deals damage equal to 80% of ATK to 1 enemy, and reuses the Active Skill if it lands as a critical hit. Each reuse permanently decreases own Crit Rate by 5%. (Reuses up to 3 times per round)",
      tags: ["repeat-attack"],
    },
    {
      id: "karim_desert_blade",
      type: "passive",
      name: "Desert Blade",
      description:
        "Normal Attack damage increases by 50%, and removes 1 buff from the target when using a Normal Attack.",
      tags: ["remove-enemy-buff"],
    },
    {
      id: "karim_lethal_strike",
      type: "passive",
      name: "Lethal Strike",
      description: "Increases ATK by 25% against enemy heroes with 50% or more current HP.",
      tags: [],
    },
    {
      id: "karim_wind_cloak",
      type: "passive",
      name: "Wind Cloak",
      description: "Dodge Rate increases by 15% for each buff on self. (Max 30%)",
      tags: ["increase-self-dodge"],
    },
    {
      id: "karim_desert_fencing",
      type: "awaken",
      name: "Desert Fencing",
      description:
        "Each Active Skill deals additional fixed damage equal to 50% of own ATK to the target. (Fixed damage cannot land as a critical hit.)",
      tags: [],
    },
    {
      id: "karim_engraving",
      type: "engraving",
      name: "Karim's Engraving",
      description:
        "Permanently increases own Crit Rate and ATK by 10% each when killing an enemy hero. (3 times per battle)",
      statBonus: [{ stat: "crit_rate", value: 20 }],
      tags: [],
    },
  ],
};
