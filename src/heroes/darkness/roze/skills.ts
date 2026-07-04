import { heroImageUrl, type Hero } from "../../types";

export const roze: Hero = {
  id: "roze",
  name: "Roze",
  rarity: "epic",
  race: "darkness",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("darkness", "roze"),
  skills: [
    {
      id: "roze_dance_of_death",
      type: "active",
      name: "Dance of Death",
      description:
        "Deals ATK 230% damage to the enemy with the lowest HP and applies a debuff that reduces their healing received by 80% for 2 turns.",
      tags: ["reduce-healing-received"],
    },
    {
      id: "roze_stiletto_heels",
      type: "passive",
      name: "Stiletto Heels",
      description:
        "Normal attacks deal ATK 130% damage to the enemy with the lowest HP and permanently reduce their Crit Resistance by 10%.",
      tags: ["reduce-crit-resistance"],
    },
    {
      id: "roze_dance_of_vengeance",
      type: "passive",
      name: "Dance of Vengeance",
      description:
        "When an ally dies, there is a 100% chance to retaliate against the enemy who killed them with ATK 100% damage.",
      tags: ["counter-attack"],
    },
    {
      id: "roze_euphoria",
      type: "passive",
      name: "Euphoria",
      description:
        "Restores 30% of max HP whenever an enemy dies. If Roze lands the killing blow, gains 100 additional energy.",
      tags: ["gain-energy", "heal-self"],
    },
    {
      id: "roze_vital_strike",
      type: "awaken",
      name: "Vital Strike",
      description:
        "Critical hits deal additional damage equal to 16% of the enemy's max HP. This effect increases by 3% each time a critical strike is triggered (up to 28%).",
      tags: ["percent-damage"],
    },
    {
      id: "roze_engraving",
      type: "engraving",
      name: "Roze's Engraving",
      description:
        "When hit by a fatal attack, survive with 1 HP and hide in the shadows for 2 turns. While in the shadow state, cannot be targeted, and Penetration increases by 50%, Crit Damage increases by 50% (activates once per battle).",
      tags: ["increase-self-crit-damage", "increase-self-penetration", "survive"],
    },
  ],
};
