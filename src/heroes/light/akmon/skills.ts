import { heroImageUrl, type Hero } from "../../types";
export const akmon: Hero = {
  id: "akmon",
  name: "Akmon",
  rarity: "epic",
  race: "light",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("light", "akmon"),
  skills: [
    {
      id: "akmon_celestial_lance",
      type: "active",
      name: "Celestial Lance",
      description:
        "Deals ATK 135% damage to an enemy and all enemies in a straight line behind it, with a 100% chance to Taunt them for 1 turns.",
      tags: ["taunt"],
    },
    {
      id: "akmon_insight",
      type: "passive",
      name: "Insight",
      description: "Deals ATK 130% damage to the closest enemy in the back row.",
      tags: [],
    },
    {
      id: "akmon_mana_draining_barrier",
      type: "passive",
      name: "Mana-Draining Barrier",
      description:
        "If taking a single attack that deals more than 20% of max HP, silence the attacker for 1 turns. (up to 4 times per battle) Until Round 3, survives with 1 HP when taking a fatal blow. Triggers once per round.",
      tags: ["survive", "silence"],
    },
    {
      id: "akmon_duel_challenge",
      type: "passive",
      name: "Duel Challenge",
      description:
        "At the start of every 2 rounds, has a 100% chance to Taunt 1 random Dealer enemy for 1 turns. (Defaults to main target if none found) Taunted enemies have a 50% chance of not gaining energy when attacking Akmon. This effect does not apply to Boss-type enemies.",
      tags: ["taunt"],
    },
    {
      id: "akmon_inquisition",
      type: "awaken",
      name: "Inquisition",
      description:
        "At the start of battle, reduce all enemies'Energy Gain Rate by 50% for 2 turns (does not apply to Energy gained from attacking or being hit). This effect cannot be dispelled and does not apply to Boss-type enemies.",
      tags: ["reduce-energy-gain"],
    },
    {
      id: "akmon_engraving",
      type: "engraving",
      name: "Akmon's Engraving",
      description:
        "Damage taken from Taunted enemies is reduced by 60%, and Dodge Rate increases by 10% each time Akmon is hit by a Taunted enemy. (Stacks up to 4 times)",
      tags: ["damage-reduction", "increase-damage-taken", "increase-self-dodge"],
    },
    {
      id: "akmon_exclusive_equipment",
      type: "exclusive-equipment",
      name: "Solas",
      description:
        "When using an Active Skill, absorb 30% of the Energy from all targeted enemies whose Energy is 100 or higher, and distribute it evenly to the two allies with the highest ATK. This effect does not trigger against boss-type enemies.",
      statBonus: [{ stat: "accuracy", value: 15 }],
      tags: ["absorb-energy", "give-energy"],
    },
  ],
};
