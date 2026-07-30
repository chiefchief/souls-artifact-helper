import { heroImageUrl, type Hero } from "../../types";
export const benzel: Hero = {
  id: "benzel",
  name: "Benzel",
  rarity: "epic",
  race: "darkness",
  role: "dealer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("darkness", "benzel"),
  skills: [
    {
      id: "benzel_boiling_earth",
      type: "active",
      name: "Boiling Earth",
      description:
        "Deal ATK 75% damage to all enemies and inflict an Acid debuff, dealing ATK 50% DoT for 3 turn(s). Acid damage removes all kinds of Shields.",
      tags: ["anti-shield", "apply-dot"],
    },
    {
      id: "benzel_death_explosion",
      type: "passive",
      name: "Death Explosion",
      description:
        "Normal attack deals ATK 115% damage to 1 random enemy and increase the Damage Taken from DoT by 15%.(stackable)",
      statBonus: [{ stat: "crit_def", value: 20 }],
      tags: ["increase-damage-taken"],
    },
    {
      id: "benzel_gathering_strength",
      type: "passive",
      name: "Gathering Strength",
      description: "Damage Taken from enemies in an Acid state reduces by 25%.",
      statBonus: [{ stat: "hp", value: 15 }],
      tags: ["damage-reduction"],
    },
    {
      id: "benzel_dark_pledge",
      type: "passive",
      name: "Dark Pledge",
      description: "Gain 100 Energy at the start of battle.",
      tags: ["gain-energy"],
    },
    {
      id: "benzel_curse_of_vitality",
      type: "awaken",
      name: "Curse of Vitality",
      description: "Heal the ally with the lowest HP by 90% of all damage dealt to enemies through your Acid damage.",
      tags: ["heal-allies"],
    },
    {
      id: "benzel_engraving",
      type: "engraving",
      name: "Benzel's Engraving",
      description:
        "For each enemy in Acid state, increase Physical Resistance of all allies in the same row including yourself by 6%. If HP is below 50%, ATK increases by 24%.",
      tags: ["increase-allies-pres"],
    },
  ],
};
