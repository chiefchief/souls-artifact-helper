import { heroImageUrl, type Hero } from "../../types";
export const rael: Hero = {
  id: "rael",
  name: "Rael",
  rarity: "epic",
  race: "light",
  role: "healer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("light", "rael"),
  skills: [
    {
      id: "rael_battle_cry",
      type: "active",
      name: "Battle Cry",
      description:
        "Applies a continuous healing to all allies, restoring HP equal to 55% of ATK for 2 turns. Additionally, grants the 2 allies with the lowest HP a shield equal to 25% of their Max HP for 2 turns.",
      tags: ["healing-over-time", "shield"],
    },
    {
      id: "rael_brave_charge",
      type: "passive",
      name: "Brave Charge",
      description:
        "On normal attacks, attacks the enemy with the highest ATK and has a 70% chance to inflict Shock for 1 turn.",
      tags: ["cc"],
    },
    {
      id: "rael_salvation",
      type: "passive",
      name: "Salvation",
      description: "At the start of each round, restores HP equal to 40% of ATK to the allied hero with the lowest HP.",
      tags: ["heal-allies"],
    },
    {
      id: "rael_insight",
      type: "passive",
      name: "Insight",
      description: "When Rael's HP is 70% or lower, Dodge Rate increases by 40%.",
      tags: ["increase-self-dodge"],
    },
    {
      id: "rael_heavenly_blessing",
      type: "awaken",
      name: "Heavenly Blessing",
      description:
        "When an allied hero (including herself) dies, grants Blessing of Light to all allied heroes for 2 turns. (Once per battle. Allies affected by Blessing of Light cannot take damage exceeding 35% of Max HP from a single attack).",
      tags: ["damage-cap"],
    },
    {
      id: "rael_engraving",
      type: "engraving",
      name: "Rael's Engraving",
      description:
        "When an adjacent back-row hero (including herself) takes fatal damage, they survive with 1 HP instead and gain a shield equal to 150% of Rael's ATK for 1 turn. Additionally, removes all debuffs from the target. (Once per battle. This effect does not trigger together with the effect that let allies survive with 1 HP, and the ally's own effect takes priority).",
      tags: ["survive", "shield", "remove-ally-debuff"],
    },
  ],
};
