import { heroImageUrl, type Hero } from "../../types";

export const jakel: Hero = {
  id: "jakel",
  name: "Jakel",
  rarity: "epic",
  race: "light",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("light", "jakel"),
  skills: [
    {
      id: "jakel_halo",
      type: "active",
      name: "Halo",
      description:
        "On Active Skill use, enters Halo state and gains a Shield equal to 20% of Max HP for 2 turn(s). While in Halo state, gains +30% Crit Rate and +50% Crit Damage.\n※Using Heavenly Sword removes Halo state.",
      tags: ["shield", "increase-self-crit-rate", "increase-self-crit-damage"],
    },
    {
      id: "jakel_heavenly_sword",
      type: "passive",
      name: "Heavenly Sword",
      description:
        "Attacks 1 enemy, dealing 150% of ATK as damage and absorbing 30% Energy. If in Halo state, unleashes Heavenly Sword to deal an additional 250% of ATK as damage to the enemy with the lowest HP and absorbs 20% Energy. Halo state is then removed.",
      tags: ["absorb-energy"],
    },
    {
      id: "jakel_curse_absorption",
      type: "passive",
      name: "Curse Absorption",
      description: "At the start of own turn, has a 100% chance to remove 1 debuff from self.",
      tags: ["remove-self-debuff"],
    },
    {
      id: "jakel_veil_of_resistance",
      type: "passive",
      name: "Veil of Resistance",
      description: "While in Halo state, CC Resistance increases by 50%.",
      tags: ["increase-cc-resistance"],
    },
    {
      id: "jakel_resonant_strike",
      type: "awaken",
      name: "Resonant Strike",
      description:
        "If not in Halo state, has a 30% chance to perform a joint attack when an allied hero uses an Active Skill or Normal Attack, dealing 120% of ATK as damage to 1 random enemy among the targets.\nIf in Halo state, the chance changes to 100% and performs a joint attack with Heavenly Sword, dealing 235% of ATK as damage to the enemy with the lowest HP among the targets and absorbing 20% Energy. Halo state is then removed. Attacks made with Heavenly Sword ignore enemy Shields.",
      tags: ["join-attack", "absorb-energy", "anti-shield"],
    },
    {
      id: "jakel_engraving",
      type: "engraving",
      name: "Jakel's Engraving",
      description:
        "When using Heavenly Sword, has a 50% chance to not remove Halo state. Jakel enters battle in Halo state.",
      tags: [],
    },
  ],
};
