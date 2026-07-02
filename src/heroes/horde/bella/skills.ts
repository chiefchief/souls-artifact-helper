import { heroImageUrl, type Hero } from "../../types";
export const bella: Hero = {
  id: "bella",
  name: "Bella",
  rarity: "epic",
  race: "horde",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("horde", "bella"),
  skills: [
    {
      id: "bella_upward_slash",
      type: "active",
      name: "Upward Slash",
      description:
        "Attacks an enemy, dealing 230% ATK damage and removing 1 buff(s). If the target is a Tank hero with no buffs, stuns them for 1 turns.",
      tags: [],
    },
    {
      id: "bella_sweeping_slash",
      type: "passive",
      name: "Sweeping Slash",
      description: "Deals 140% ATK damage to an enemy.",
      tags: [],
    },
    {
      id: "bella_encouraging_whisper",
      type: "passive",
      name: "Encouraging Whisper",
      description:
        "Until round 5, Bella cannot take damage exceeding 51% of her Max HP from a single attack. If a Horde hero is in an adjacent front row position, they receive the same effect.",
      tags: [],
    },
    {
      id: "bella_opening_strike",
      type: "passive",
      name: "Opening Strike",
      description:
        "If Bella has no debuffs, she performs a joint attack when an ally uses a normal attack, dealing 100% ATK damage and removing 1 buff(s). (Once per round)",
      tags: ["join-attack"],
    },
    {
      id: "bella_hone_blade",
      type: "awaken",
      name: "Hone Blade",
      description:
        "Bella gains a Sharpness buff for 2 turns at the start of battle, and thereafter gains a Sharpness buff for 2 turns each time she removes an enemy buff. While Sharpness is active, ATK increases by 20% and Penetration increases by 60%. (Sharpness buff does not stack.)",
      tags: ["increase-self-penetration", "remove-enemy-buff"],
    },
    {
      id: "bella_engraving",
      type: "engraving",
      name: "Bella's Engraving",
      description:
        "Bella's attacks inflict Injury equal to 30% of damage dealt, reducing Max HP. When attacking a Tank hero, inflicts Injury equal to 60% of damage dealt. (Injury can reduce up to 50% of Max HP and persists after revival. Does not affect Boss-type enemies.)",
      tags: [],
    },
    {
      id: "bella_bellas_secret_art",
      type: "exclusive-equipment",
      name: "Bella's Secret Art",
      description:
        "Crit Rate increases by 30% and Crit Damage by 30% against Tank heroes. Additionally, when attacking a Tank hero, permanently increases the target's damage taken by 15%. (Up to 2 times per target) This increased damage taken effect does not apply to boss-type enemies.",
      tags: ["increase-damage-taken"],
    },
  ],
};
