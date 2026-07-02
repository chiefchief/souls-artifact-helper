import { heroImageUrl, type Hero } from "../../types";
export const zeke: Hero = {
  id: "zeke",
  name: "Zeke",
  rarity: "epic",
  race: "darkness",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("darkness", "zeke"),
  skills: [
    {
      id: "zeke_assault_cogwheel",
      type: "active",
      name: "Assault Cogwheel",
      description:
        "Deal damage (180% of ATK) to 1 enemy and all enemies behind them in a straight line, with a 60% chance of applying Silence to them for 1 turn(s).",
      tags: ["silence"],
    },
    {
      id: "zeke_spiked_shield",
      type: "passive",
      name: "Spiked Shield",
      description:
        "Normal Attack deals damage (105% of ATK) to 1 enemy and the adjacent enemy in the back, and reduce their Speed by 5. (Stacks up to 4 times)",
      tags: [],
    },
    {
      id: "zeke_darkguard",
      type: "passive",
      name: "Darkguard",
      description: "Reduce damage taken from Normal Attacks by 25%.",
      statBonus: [{ stat: "hp", value: 25 }],
      tags: ["damage-reduction"],
    },
    {
      id: "zeke_contract_of_life",
      type: "passive",
      name: "Contract of Life",
      description:
        "When HP drops below 70%, apply HoT to yourself and recover 30% of Max HP for 4 turns. (1 times per combat)",
      tags: ["healing-over-time"],
    },
    {
      id: "zeke_magical_growth",
      type: "awaken",
      name: "Magical Growth",
      description:
        "Obtain 50 energy at the beginning of combat. Increase chances of Silence for Active Skill by 20%, and increase duration by 1 turn(s).",
      tags: ["gain-energy", "silence"],
    },
    {
      id: "zeke_engraving",
      type: "engraving",
      name: "Zeke's Engraving",
      description:
        "When hit alone by the active attack of an enemy, launch counter-attack that returns 80% of damage taken.",
      tags: ["counter-attack"],
    },
    {
      id: "zeke_duality_of_evil",
      type: "exclusive-equipment",
      name: "Duality of Evil",
      description:
        "For each Light hero on the enemy team, Zeke's damage taken is reduced by 10%.(Stacks up to 5 times)\nWhen an enemy reuses a skill that directly damages an ally, Zeke nullifies the damage and gains 30 Energy. (Up to 3 times per battle)",
      tags: ["damage-reduction", "gain-energy"],
    },
  ],
};
