import { heroImageUrl, type Hero } from "../../types";
export const scarlet: Hero = {
  id: "scarlet",
  name: "Scarlet",
  rarity: "epic",
  race: "human",
  role: "healer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("human", "scarlet"),
  skills: [
    {
      id: "scarlet_slippery_bubble",
      type: "active",
      name: "Slippery Bubble",
      description:
        "Heals 3 allies with the lowest HP by 75% of ATK and grants continuous healing, recovering 95% of ATK for 2 turns. Additionally, increases their Dodge Rate by 35% for 2 turns. (Cannot be dispelled)",
      tags: ["heal-allies", "healing-over-time", "increase-self-dodge"],
    },
    {
      id: "scarlet_weakening_potion_bomb",
      type: "passive",
      name: "Weakening Potion Bomb",
      description:
        "Normal attacks target the enemy with the highest energy, reducing their ATK by 16% and Accuracy by 20% for 2 turns. (Cannot be dispelled; prioritizes the nearest enemy if energies are tied)",
      tags: [],
    },
    {
      id: "scarlet_auto_recovery",
      type: "passive",
      name: "Auto Recovery",
      description:
        "From the 2nd round, heals the ally with the lowest HP by 90% of ATK at the start of every 2 rounds. Additionally, when an ally dodges an attack, increases their Crit Rate by 20%. (Up to 2 times per ally)",
      tags: ["heal-allies"],
    },
    {
      id: "scarlet_symbol_of_victory",
      type: "passive",
      name: "Symbol of Victory",
      description:
        "All allies in the same row have their CC Resistance increased by 25% and their Speed increased by 18.",
      statBonus: [{ stat: "cc_res", value: 66 }],
      tags: ["increase-allies-speed", "increase-cc-resistance"],
    },
    {
      id: "scarlet_magitech_product",
      type: "awaken",
      name: "Magitech Product",
      description:
        "Upon death (activates even during enemy's continuous attack), heals all remaining allies by 25% of their max HP and applies a buff that increases Dodge Rate by 60% for 3 turns.",
      statBonus: [{ stat: "dodge_rate", value: 60 }],
      tags: ["heal-allies", "increase-self-dodge"],
    },
    {
      id: "scarlet_engraving",
      type: "engraving",
      name: "Scarlet's Engraving",
      description:
        "At the start of the battle, reduces the energy of the enemy in the symmetrical position by 100 and subsequently reduces their energy by 25 at the start of each round. (If the symmetrical position is empty, targets the primary target)",
      tags: ["reduce-energy"],
    },
  ],
};
