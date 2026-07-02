import { heroImageUrl, type Hero } from "../../types";

export const vescura: Hero = {
  id: "vescura",
  name: "Vescura",
  rarity: "epic",
  race: "darkness",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("darkness", "vescura"),
  skills: [
    {
      id: "vescura_demon_s_heart",
      type: "active",
      name: "Demon's Heart",
      description:
        "Applies a debuff to all enemies, reducing Crit Resistance by 20% for 2 turns. Additionally, applies a debuff that increases damage taken by 30% for 1 turn{s} to the closest enemy in the front row. (Vescura cannot reuse his Active Skill)",
      tags: ["increase-crit-resistance", "increase-damage-taken"],
    },
    {
      id: "vescura_dark_orb",
      type: "passive",
      name: "Dark Orb",
      description:
        "Unleash a chain attack on adjacent enemies, dealing ATK 130% as damage. This attack can chain up to 2 times.",
      tags: [],
    },
    {
      id: "vescura_wings_of_defiance",
      type: "passive",
      name: "Wings of Defiance",
      description:
        "At the start of battle, if Vescura is placed in the 2nd or 3rd row, reduces the Speed of enemy Light heroes by 15.",
      statBonus: [{ stat: "cc_res", value: 80 }],
      tags: [],
    },
    {
      id: "vescura_count_s_prestige",
      type: "passive",
      name: "Count's Prestige",
      description:
        "When Vescura takes damage from Active Skills or Normal Attacks, there is a 100% chance to restore 50 Energy to a random ally in the same row (1 time per round)",
      tags: ["give-energy"],
    },
    {
      id: "vescura_demonic_pact",
      type: "awaken",
      name: "Demonic Pact",
      description:
        "When using Active Skill, there is a 60% chance to apply [Blood Host] to all enemies for 2 turn(s). Enemies affected by [Blood Host] gain 10 less Energy from normal attacks. At the start of each round, Vescura attacks enemies afflicted with [Blood Host], dealing additional damage equal to 20% of their current HP. ([Blood Host] does not stack, and additional damage does not exceed 250% of Vescura's ATK)",
      tags: [],
    },
    {
      id: "vescura_engraving",
      type: "engraving",
      name: "Vescura's Engraving",
      description:
        "When an enemy hero afflicted with [Blood Host] triggers an additional attack (including joint attack and counterattack), reduce their Energy by 30. This effect does not apply to boss-type enemies. (Up to 2 time(s) per round, includes invisible and shadow-state enemies)\nChance to apply [Blood Host] to Dealers, Supporters, and Boss-type enemies is increased by 40%.",
      tags: ["reduce-energy"],
    },
  ],
};
