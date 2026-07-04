import { heroImageUrl, type Hero } from "../../types";
export const dextor: Hero = {
  id: "dextor",
  name: "Dextor",
  rarity: "epic",
  race: "undead",
  role: "supporter",
  attribute: "agility",
  imageUrl: heroImageUrl("undead", "dextor"),
  skills: [
    {
      id: "dextor_spear_of_the_void",
      type: "active",
      name: "Spear of the Void",
      description:
        "Deal ATK 160% damage to all enemies in the front row and increase the Energy of all allies adjacent to you by 25 for each enemy hit. (Dextor starts with full Energy)",
      tags: ["give-energy"],
    },
    {
      id: "dextor_piercing_curse",
      type: "passive",
      name: "Piercing Curse",
      description:
        "At the start of battle, apply a buff to all adjacent allies, increasing their ATK by 24% for 5 turn(s).",
      statBonus: [
        { stat: "pen", value: 15 },
        { stat: "cc_res", value: 50 },
      ],
      tags: ["increase-allies-attack"],
    },
    {
      id: "dextor_subtlety",
      type: "passive",
      name: "Subtlety",
      description: "Increase Crit Resistance of yourself and all allies adjacent to you by 40%.",
      tags: ["increase-crit-resistance"],
    },
    {
      id: "dextor_burning_vengeance",
      type: "passive",
      name: "Burning Vengeance",
      description:
        "Upon death, heal the ally with the highest ATK by 27% of its max HP and increase its ATK by 35% of (Dextor's) ATK. (once per battle)",
      tags: ["heal-allies", "increase-allies-attack"],
    },
    {
      id: "dextor_swamp_wanderer",
      type: "awaken",
      name: "Swamp Wanderer",
      description: "When an enemy dies, heal all adjacent allies by 100% of your ATK.",
      tags: ["heal-allies"],
    },
    {
      id: "dextor_engraving",
      type: "engraving",
      name: "Dextor's Engraving",
      description:
        "Increase the energy of all adjacent allies by 20 when an enemy dies. Increase the Speed of all adjacent allies by 12 when an ally dies.",
      tags: ["give-energy", "increase-allies-speed"],
    },
  ],
};
