import { heroImageUrl, type Hero } from "../../types";
export const nox: Hero = {
  id: "nox",
  name: "Nox",
  rarity: "epic",
  race: "undead",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("undead", "nox"),
  skills: [
    {
      id: "nox_breath_of_the_dead",
      type: "active",
      name: "Breath of the Dead",
      description:
        "Deals 170% attack damage to an enemy and all enemies directly behind them in a straight line, and applies a Curse of Recovery for 2 turns.\n※ Enemies afflicted with Curse of Recovery will have their healing received reduced by 65%, and 70% of that amount is absorbed by the ally with the lowest HP. However, if the caster has placed multiple Curse of Recovery, only the first applied will be effective.",
      tags: ["heal-allies", "reduce-healing-received"],
    },
    {
      id: "nox_abyssal_strike",
      type: "passive",
      name: "Abyssal Strike",
      description: "At the beginning of your turn, you have a 70% chance of removing all debuffs.",
      statBonus: [{ stat: "atk", value: 20 }],
      tags: [],
    },
    {
      id: "nox_ebony_armor",
      type: "passive",
      name: "Ebony Armor",
      description: "When receiving a magical attack, gain an additional 40 Energy.",
      statBonus: [{ stat: "mres", value: 30 }],
      tags: ["gain-energy"],
    },
    {
      id: "nox_ghosts_residue",
      type: "passive",
      name: "Ghost's Residue",
      description: "Upon death, resurrect after 2 rounds with 70% health and 100% energy. (Up to 1 times per battle)",
      tags: ["revive-self"],
    },
    {
      id: "nox_roar_of_death",
      type: "awaken",
      name: "Roar of Death",
      description:
        "Upon resurrection, apply a taunt debuff to all enemies for 1 turns, and a buff that reduces damage taken by 50% for 1 turns to yourself.",
      tags: ["damage-reduction", "taunt"],
    },
    {
      id: "nox_engraving",
      type: "engraving",
      name: "Nox's Engraving",
      description:
        "Until round 5, you and all adjacent allies behind you are immune to Silence (remains active even if Nox dies). Upon death, reduce all enemies' energy by 50 (up to 2 times per battle), and the resurrection time is changed to after 1 round.",
      tags: ["reduce-energy", "revive-self"],
    },
  ],
};
