import { heroImageUrl, type Hero } from "../../types";
export const lumen: Hero = {
  id: "lumen",
  name: "Lumen",
  rarity: "epic",
  race: "light",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("light", "lumen"),
  skills: [
    {
      id: "lumen_light_of_purification",
      type: "active",
      name: "Light of Purification",
      description:
        "Deals ATK 140% damage to an enemy and all enemies in a straight line behind the target, and removes 1 buff(s) from the hit enemies.",
      tags: ["remove-enemy-buff"],
    },
    {
      id: "lumen_empowered_strike",
      type: "passive",
      name: "Empowered Strike",
      description: "Increase ATK of normal attacks by 30%",
      tags: [],
    },
    {
      id: "lumen_emergency_shield",
      type: "passive",
      name: "Emergency Shield",
      description:
        "At the start of battle, grants a shield equal to 100% of own HP to the ally with the lowest HP for 2 turns.",
      tags: ["shield"],
    },
    {
      id: "lumen_tenacity",
      type: "passive",
      name: "Tenacity",
      description:
        "When an ally dies, Lumen permanently reduces the ATK of the enemy that killed them by 15%. (Once per battle)",
      tags: ["reduce-attack"],
    },
    {
      id: "lumen_barrier_of_light",
      type: "awaken",
      name: "Barrier of Light",
      description:
        "At the start of battle, Lumen creates a Barrier of Light across the battlefield in front of her. Allies inside the barrier take 20% less damage, and have a 10% chance to ignore damage when hit by active or normal attacks. The barrier lasts for 7 turns.",
      tags: [],
    },
    {
      id: "lumen_engraving",
      type: "engraving",
      name: "Lumen's Engraving",
      description:
        "Allies inside the Barrier of Light gain 15% ATK and 25% Crit DMG. When an ally inside the Barrier of Light is hit by an active or normal attack, Lumen has a 50% chance to retaliate, dealing 100% ATK damage to the attacker and stunning them for 1 turn.",
      tags: ["cc", "counter-attack"],
    },
  ],
};
