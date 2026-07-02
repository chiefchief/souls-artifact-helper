import { heroImageUrl, type Hero } from "../../types";
export const bahzam: Hero = {
  id: "bahzam",
  name: "Bahzam",
  rarity: "epic",
  race: "darkness",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("darkness", "bahzam"),
  skills: [
    {
      id: "bahzam_split_the_darkness",
      type: "active",
      name: "Split the Darkness",
      description:
        "Deal ATK 280% damage to 1 enemy. When Bahzam kills an enemy in any way, gain an extra life. If you die, revive at the end of the current round with 70% HP and 50% Energy. (max 3 time(s))",
      tags: ["revive-self"],
    },
    {
      id: "bahzam_cheap_shot",
      type: "passive",
      name: "Cheap Shot",
      description:
        "ATK of normal attack increases by 50%. Upon a normal attack, gain a buff that increases Penetration by 50% for 3 turn(s).",
      tags: ["increase-self-penetration"],
    },
    {
      id: "bahzam_thirst_for_blood",
      type: "passive",
      name: "Thirst for Blood",
      description:
        "Increase Dodge Rate by 40% at the start of battle.This effect reduces by 5% every time you are attacked.",
      statBonus: [
        { stat: "dodge_rate", value: 25 },
        { stat: "pen", value: 25 },
      ],
      tags: ["increase-self-dodge"],
    },
    {
      id: "bahzam_frenzied_butcher",
      type: "passive",
      name: "Frenzied Butcher",
      description:
        "When you dodge, gain a buff that increases ATK by 16% for 1 turn(s) and additionally gain 30 Energy.",
      tags: ["gain-energy"],
    },
    {
      id: "bahzam_impenetrable_darkness",
      type: "awaken",
      name: "Impenetrable Darkness",
      description:
        "Upon death (activates even during an enemy's continuous attack), deal ATK 180% damage to the enemy attacker and apply a debuff that reduces their DEF by 80% for 3 turns. (2 times per battle)",
      tags: ["reduce-defense"],
    },
    {
      id: "bahzam_engraving",
      type: "engraving",
      name: "Bahzam's Engraving",
      description:
        "Every time you are resurrected, reduce energy of all enemies by 35, and increase energy of all allies by 30.",
      tags: ["give-energy", "reduce-energy"],
    },
    {
      id: "bahzam_agent_of_death",
      type: "exclusive-equipment",
      name: "Agent of Death",
      description:
        "Upon Bahzam's death, he inflicts the unremovable [Mark of the Reaper] debuff on the attacker for 3 turns, dealing damage over time equal to 120% of ATK. (Once per battle, also applies to heroes in Shadow and Invisible state)\nEnemies afflicted with [Mark of the Reaper] take 20% increased damage.\nIf a hero afflicted with [Mark of the Reaper] dies, Bahzam is revived.",
      tags: ["apply-dot", "increase-damage-taken", "revive-self"],
    },
  ],
};
