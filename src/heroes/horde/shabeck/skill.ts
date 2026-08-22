import { heroImageUrl, type Hero } from "../../types";
export const shabeck: Hero = {
  id: "shabeck",
  name: "Shabeck",
  rarity: "epic",
  race: "horde",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("horde", "shabeck"),
  skills: [
    {
      id: "shabeck_cruel_spin",
      type: "active",
      name: "Cruel Spin",
      description:
        "Deals 180% ATK as damage to enemies in the same row as the enemy with the highest HP and inflicts Bleed, dealing 15% of own max HP as DoT for 2 turn(s).",
      tags: ["apply-dot"],
    },
    {
      id: "shabeck_ships_helm",
      type: "passive",
      name: "Ship's Helm",
      description:
        "Attacks an enemy to deal 130% ATK as damage and inflicts Bleed, dealing 8% of own max HP as DoT for 1 turn(s).",
      tags: ["apply-dot"],
    },
    {
      id: "shabeck_sharks_hunt",
      type: "passive",
      name: "Shark's Hunt",
      description: "The lower the HP, the higher damage dealt. (All damage dealt increases by 0.6% per 1% of HP lost)",
      tags: [],
    },
    {
      id: "shabeck_seasoned_voyage",
      type: "passive",
      name: "Seasoned Voyage",
      description: "Each time Shabeck is hit by a critical attack, his Crit DEF increases by 10%. (Crit DEF up to 50%)",
      tags: ["increase-self-crit-defense"],
      statBonus: [{ stat: "pres", value: 15 }],
    },
    {
      id: "shabeck_everlasting_wound",
      type: "awaken",
      name: "Everlasting Wound",
      description:
        "Enemy heroes affected by Shabeck's Bleed suffer Injury equal to 60% of the damage received when hit by an ally's Active Skill or Normal Attack. (Injury applies up to 50% of max HP, persists after revival, and does not apply to Boss-type enemies.)",
      tags: [],
    },
    {
      id: "shabeck_engraving",
      type: "engraving",
      name: "Shabeck's Engraving",
      description:
        "For every 2 times direct attack damage is received, inflicts Bleed on the attacker, dealing DoT equal to 10% of own Max HP for 2 turn(s), and restores 5% of own Max HP.",
      tags: ["apply-dot", "heal-self"],
    },
  ],
};
