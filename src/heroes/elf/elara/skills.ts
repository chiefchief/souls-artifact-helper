import { heroImageUrl, type Hero } from "../../types";
export const elara: Hero = {
  id: "elara",
  name: "Elara",
  rarity: "epic",
  race: "elf",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("elf", "elara"),
  skills: [
    {
      id: "elara_sun_emblem",
      type: "active",
      name: "Sun Emblem",
      description:
        "Deal damage (130% of ATK) to 1 enemy with high ATK and all adjacent enemies, and apply a Dazzling debuff on them for 2 turn(s).\n※Accuracy of enemies under the Dazzling debuff will decrease by 10%. When they attack, if their Accuracy is lower than the target's Dodge rate, their attack will inevitably miss and dodge will occur.",
      tags: [],
    },
    {
      id: "elara_sphere_of_light",
      type: "passive",
      name: "Sphere of Light",
      description:
        "Normal attacks deal damage (130% of ATK) to 1 random enemy, and apply a Dazzling debuff for 1 turns.",
      statBonus: [{ stat: "hp", value: 14 }],
      tags: [],
    },
    {
      id: "elara_torrent",
      type: "passive",
      name: "Torrent",
      description: "Increase ATK by 5% whenever you use a normal attack. (Stacks up to 5 times)",
      tags: [],
    },
    {
      id: "elara_sun_priestess",
      type: "passive",
      name: "Sun Priestess",
      description: "When attacking with HP below 50%, heal yourself by 70% of the damage dealt.",
      tags: ["heal-self"],
    },
    {
      id: "elara_judge",
      type: "awaken",
      name: "Judge",
      description:
        "When you apply Dazzling debuff to enemies who already has Dazzling debuff, their energy will decrease by 65, and you have a 100% chance to apply Shock to them for 2 turns.",
      tags: ["reduce-energy", "cc"],
    },
    {
      id: "elara_engraving",
      type: "engraving",
      name: "Elara's Engraving",
      description:
        "You and all allies adjacent to you do not take damage exceeding 35% of your max HP from a single attack until round 3.",
      tags: ["damage-cap"],
    },
    {
      id: "elara_blazing_light",
      type: "exclusive-equipment",
      name: "Blazing Light",
      description:
        "All adjacent allies' Dodge Rate increases by 15%.\nUntil round 5, Normal Attacks have a 50% chance to attack one additional random enemy.",
      tags: ["increase-self-dodge"],
    },
  ],
};
