import { heroImageUrl, type Hero } from "../../types";
export const ash: Hero = {
  id: "ash",
  name: "Ash",
  rarity: "epic",
  race: "undead",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("undead", "ash"),
  skills: [
    {
      id: "ash_hellfire",
      type: "active",
      name: "Hellfire",
      description:
        "Deal ATK 150% damage to all enemies in the front row and apply a debuff that reduces their DEF by 30% for 3 turn(s).",
      tags: ["reduce-defense"],
    },
    {
      id: "ash_soul_burn",
      type: "passive",
      name: "Soul Burn",
      description:
        "At the start of every 2 round(s), apply a buff that increases Lifesteal Rate by 50% for 2 turn(s) to 2 allies with low HP.",
      tags: ["increase-allies-lifesteal"],
    },
    {
      id: "ash_bloody_foot",
      type: "passive",
      name: "Bloody Foot",
      description: "Whenever an ally dies, permanently reduce the DEF of all enemies by 15%. (max 4 stacks)",
      tags: ["reduce-defense"],
    },
    {
      id: "ash_hell_hook",
      type: "passive",
      name: "Hell Hook",
      description: "When attacking with HP below 40%, heal yourself by 80% of the damage dealt.",
      tags: ["heal-self"],
    },
    {
      id: "ash_burning_flame",
      type: "awaken",
      name: "Burning Flame",
      description:
        "Upon death (activates even during an enemy's continuous attack), reduce the Energy of all enemies by 60 and apply a debuff that increases their Damage Taken by 28% for 2 turn(s). (once per battle)",
      tags: ["reduce-energy"],
    },
    {
      id: "ash_engraving",
      type: "engraving",
      name: "Ash's Engraving",
      description: "When HP is below 60%, ATK increases by 22%, and Magic Resistance increases by 30%.",
      tags: ["increase-self-attack", "increase-self-defense"],
    },
  ],
};
