import { heroImageUrl, type Hero } from "../../types";
export const fiona: Hero = {
  id: "fiona",
  name: "Fiona",
  rarity: "epic",
  race: "elf",
  role: "healer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("elf", "fiona"),
  skills: [
    {
      id: "fiona_peaceful_pollen",
      type: "active",
      name: "Peaceful Pollen",
      description:
        "Heal the ally with the lowest HP by 250% of your ATK and apply it a Hypnotic Scent buff for 2 turn(s).\n※ Enemies that attack allies with Hypnotic Scent have a 80% chance to be put into Sleep for 2 turns.",
      tags: ["heal-allies", "sleep"],
    },
    {
      id: "fiona_waves_of_spring",
      type: "passive",
      name: "Waves of Spring",
      description: "Heal the ally with the lowest HP by 80% of damage dealt on your normal attack.",
      statBonus: [
        { stat: "pen", value: 10 },
        { stat: "acc", value: 20 },
      ],
      tags: ["heal-allies"],
    },
    {
      id: "fiona_flowers_beauty",
      type: "passive",
      name: "Flower's Beauty",
      description:
        "The active skill heals all additional allies adjacent to the target. The additional healing amount corresponds to 28% of the original healing amount.",
      tags: ["heal-allies"],
    },
    {
      id: "fiona_cultivate",
      type: "passive",
      name: "Cultivate",
      description:
        "Until round 5, at the start of each round, apply a buff to the allies with HP below 40% that increases Healing Received by 20% for 1 turn(s).",
      tags: ["increase-healing-received"],
    },
    {
      id: "fiona_flower_fairy_queen",
      type: "awaken",
      name: "Flower Fairy Queen",
      description:
        "The chance of a Hypnotic Scent buff increases by 10%. At the start of every 3 round(s), apply a Hypnotic Scent buff to 1 random ally in the front row for 2 turn(s).\nGain 40 Energy whenever an ally dies.",
      tags: ["gain-energy", "sleep"],
    },
    {
      id: "fiona_engraving",
      type: "engraving",
      name: "Fiona's Engraving",
      description:
        "Increase the duration of Hypnotic Scent buff on Active Skill by 1 turn. When allies with Hypnotic Scent buff are attacked, Fiona has a 50% chance of receiving 30 energy.",
      tags: ["sleep"],
    },
    {
      id: "fiona_dream_bloom",
      type: "exclusive-equipment",
      name: "Dream Bloom",
      description:
        "Reduces damage taken by allies with the Hypnotic Scent buff by 20%. (Does not stack)\nWhen an ally with the Hypnotic Scent buff dies, there is a 70% chance to inflict Sleep on all enemies for 1 turn. (Once per battle)\nWhen an allied hero other than self drops to 30% HP or below, heals that ally by 200% of ATK and grants the Hypnotic Scent buff for 2 turns. (Once per battle)",
      tags: ["damage-reduction", "heal-allies", "sleep"],
    },
  ],
};
