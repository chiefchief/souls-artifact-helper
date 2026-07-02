import { heroImageUrl, type Hero } from "../../types";
export const muerte: Hero = {
  id: "muerte",
  name: "Muerte",
  rarity: "epic",
  race: "undead",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("undead", "muerte"),
  skills: [
    {
      id: "muerte_curse_of_the_wraith",
      type: "active",
      name: "Curse of the Wraith",
      description:
        "Deal 120% ATK damage to the 2 enemies with the highest HP, and has a 70% chance to Bind them for 1 turn.",
      tags: ["cc"],
    },
    {
      id: "muerte_tomb_of_the_dead",
      type: "passive",
      name: "Tomb of the Dead",
      description:
        "When using Active Skills or Normal Attacks, deal additional damage to the target equal to 7% of Muerte's Max HP and recover 7% of Muerte's HP.",
      statBonus: [{ stat: "pres", value: 15 }],
      tags: [],
    },
    {
      id: "muerte_self_sacrifice",
      type: "passive",
      name: "Self-Sacrifice",
      description:
        "At the start of every 2 rounds, reduce your own HP by 10% and grant 1 Nullification Shield to the ally (excluding Muerte) with the lowest HP. This effect does not trigger if Muerte's HP is 30% or lower. (A Nullification Shield blocks 1 instance of damage from Normal Attacks and Active Skills, and cannot be stacked.)",
      tags: ["shield"],
    },
    {
      id: "muerte_fallen_shield",
      type: "passive",
      name: "Fallen Shield",
      description:
        "When an allied hero (excluding Muerte) falls to 50% HP or below, grant that ally a buff that increases Lifesteal by 40% and reduces damage taken by 20% for 2 turns. (Once per target)",
      tags: ["damage-reduction", "increase-allies-lifesteal"],
    },
    {
      id: "muerte_harbinger_of_death",
      type: "awaken",
      name: "Harbinger of Death",
      description:
        "When an enemy hero dies, revive 1 random fallen ally with 50% HP and 100% Energy and grant 1 Nullification Shield. (Once per battle)\nIf an enemy hero survives an attack that would have killed them, inflict Bind for 2 turns on the target. (Once per target)",
      tags: ["revive-ally", "shield", "survive", "cc"],
    },
    {
      id: "muerte_engraving",
      type: "engraving",
      name: "Muerte's Engraving",
      description:
        "At the start of battle, gain 1 Nullification Shield.\nWhen hit 3 times by Normal Attacks and Active Skills, grant yourself 1 Nullification Shield. (Up to 3 times per battle)",
      tags: ["shield"],
    },
  ],
};
