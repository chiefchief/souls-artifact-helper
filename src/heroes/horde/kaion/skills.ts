import { heroImageUrl, type Hero } from "../../types";
export const kaion: Hero = {
  id: "kaion",
  name: "Kaion",
  rarity: "epic",
  race: "horde",
  role: "dealer",
  attribute: "strength",
  imageUrl: heroImageUrl("horde", "kaion"),
  skills: [
    {
      id: "kaion_suffocating_blow",
      type: "active",
      name: "Suffocating Blow",
      description:
        "Deal 180% ATK as damage to 1 enemy and all enemies in a straight path behind it, and heal yourself by 50% of the damage dealt.",
      tags: ["heal-self"],
    },
    {
      id: "kaion_devouring_blade",
      type: "passive",
      name: "Devouring Blade",
      description: "ATK of normal attack increases by 45%",
      statBonus: [{ stat: "pres", value: 15 }],
      tags: [],
    },
    {
      id: "kaion_wounded_beast",
      type: "passive",
      name: "Wounded Beast",
      description: "At the start of each round from round 2, ATK increases by 6%. (max 10 stacks)",
      tags: ["increase-self-attack"],
    },
    {
      id: "kaion_wild_instinct",
      type: "passive",
      name: "Wild Instinct",
      description: "The closer you are to the enemy, the higher ATK increases. (max 40%)",
      tags: ["increase-self-attack"],
    },
    {
      id: "kaion_warrior_of_the_battlefield",
      type: "awaken",
      name: "Warrior of the Battlefield",
      description:
        "Just before death, gain a Shield equal to 50% of max HP for 2 turn(s) and survive. Gain an additional 100 Energy. (once per battle)",
      tags: ["shield", "survive", "gain-energy"],
    },
    {
      id: "kaion_engraving",
      type: "engraving",
      name: "Kaion's Engraving",
      description: "When HP is below 30%, ATK increases by 20%, and reduce damage taken by 20%.",
      tags: ["increase-self-attack", "damage-reduction"],
    },
    {
      id: "kaion_ancient_beasts_bone",
      type: "exclusive-equipment",
      name: "Ancient Beast's Bone",
      description:
        "Kaion gains a Shield fpr 1 turn equal to the excess healing from his Active Skill. Kaion enters Giant state for 4 turns when an allied hero dies. (Once per battle)\nWhile in Giant state, his Crit Rate increases by 30% and Crit Resistance increases by 50%, and when attacking enemies in the front row, he ignores 30% of their Physical Resistance.",
      tags: ["shield", "increase-crit-rate", "increase-crit-resistance"],
    },
  ],
};
