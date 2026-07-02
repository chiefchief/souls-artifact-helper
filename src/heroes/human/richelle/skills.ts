import { heroImageUrl, type Hero } from "../../types";

export const richelle: Hero = {
  id: "richelle",
  name: "Richelle",
  rarity: "epic",
  race: "human",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("human", "richelle"),
  skills: [
    {
      id: "richelle_imperial_protection",
      type: "active",
      name: "Imperial Protection",
      description:
        "Apply a Shield to you and all allies adjacent to you equal to 23% of (Richelle's) max HP for 2 turn(s).",
      tags: ["shield"],
    },
    {
      id: "richelle_drastic_measure",
      type: "passive",
      name: "Drastic Measure",
      description:
        "You and all allies adjacent to you do not take damage exceeding 35% of your max HP from a single attack until round 3.",
      tags: ["damage-cap"],
    },
    {
      id: "richelle_heartless_command",
      type: "passive",
      name: "Heartless Command",
      description:
        "Gain 5 Energy additionally when attacked. When using a Shield, you remove 1 debuff(s) from each ally.",
      tags: ["gain-energy", "remove-ally-debuff"],
    },
    {
      id: "richelle_reversal",
      type: "passive",
      name: "Reversal",
      description: "Until round 5, at the start of each round, if HP is below 40%, heal yourself by 25% of max HP.",
      tags: ["heal-self"],
    },
    {
      id: "richelle_strict_military_discipline",
      type: "awaken",
      name: "Strict Military Discipline",
      description:
        "Just before death, gain a Damage Immunity Shield for 1 turn(s) and survive. If you die afterwards, apply a Shield to all adjacent allies, equal to 25% of (Richelle's) max HP for 2 turn(s). (once",
      tags: ["shield", "survive"],
    },
    {
      id: "richelle_engraving",
      type: "engraving",
      name: "Richelle's Engraving",
      description: "ATK and Crit Rate increase by 25% when you have a Shield.",
      tags: ["increase-self-attack", "increase-self-crit-rate"],
    },
  ],
};
