import { heroImageUrl, type Hero } from "../../types";
export const dolucos: Hero = {
  id: "dolucos",
  name: "Dolucos",
  rarity: "epic",
  race: "horde",
  role: "dealer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("horde", "dolucos"),
  skills: [
    {
      id: "dolucos_chain_lightning",
      type: "active",
      name: "Chain Lightning",
      description:
        "Deal ATK 155% damage to adjacent enemies in a chain attack. This attack can be chained up to 3 times, and with each chain, the ATK increases by 20%.",
      tags: [],
    },
    {
      id: "dolucos_lightning",
      type: "passive",
      name: "Lightning",
      description: "ATK of normal attack increases by 30%, and you gain an additional 30 Energy from a normal attack.",
      tags: ["gain-energy"],
    },
    {
      id: "dolucos_subtle_method",
      type: "passive",
      name: "Subtle Method",
      description:
        "At the end of every 2 round(s), remove 2 debuff(s) from yourself and all allies in the same row. Upon removing a debuff, you gain 30 Energy. (once per round)",
      tags: ["remove-ally-debuff", "gain-energy"],
    },
    {
      id: "dolucos_awe",
      type: "passive",
      name: "Awe",
      description: "At the start of every 5 round(s), heal 50% of max HP.",
      tags: ["heal-self"],
    },
    {
      id: "dolucos_grand_magician",
      type: "awaken",
      name: "Grand Magician",
      description:
        "If all allies are killed and you are the last one standing, you transform into a giant for 2 turn(s), increasing ATK by 80% and DEF by 110% (once per battle)",
      tags: ["increase-self-attack", "increase-self-defense"],
    },
    {
      id: "dolucos_engraving",
      type: "engraving",
      name: "Dolucos's Engraving",
      description:
        "When attacking over 3 enemies with chain attack, reduce energy of all attacked enemies by 20, and have a 30% chance of Silencing them for 1 turns.",
      tags: ["reduce-energy", "silence"],
    },
    {
      id: "dolucos_heavenly_thunder",
      type: "exclusive-equipment",
      name: "Heavenly Thunder",
      description:
        "At the start of battle, Dolucos gains 20 Energy for each allied Horde hero and increases ATK by 10% per hero (up to 30%).\nDolucos's skills are enhanced.\nChain Lightning: Now chains to random enemies\nSubtle Method: Now triggers at the end of each round\nAwe: Now triggers at the start of every 4 rounds",
      tags: ["gain-energy", "increase-self-attack"],
    },
  ],
};
