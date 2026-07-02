import { heroImageUrl, type Hero } from "../../types";
export const lagou: Hero = {
  id: "lagou",
  name: "Lagou",
  rarity: "epic",
  race: "horde",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("horde", "lagou"),
  skills: [
    {
      id: "lagou_shield_slam",
      type: "active",
      name: "Shield Slam",
      description: "Deal ATK 130% damage to all enemies in the front row, and Stun them for 1 turn at a 55% chance.",
      tags: ["cc"],
    },
    {
      id: "lagou_bull_rush",
      type: "passive",
      name: "Bull Rush",
      description: "When attacked every 4 times, Stun the enemy attacker for 1 turn.",
      tags: ["cc"],
    },
    {
      id: "lagou_imposing_force",
      type: "passive",
      name: "Imposing Force",
      description: "Whenever you are hit, Damage Taken reduces by 12%. Resets at the start of each round.",
      statBonus: [{ stat: "cc_res", value: 100 }],
      tags: ["damage-reduction"],
    },
    {
      id: "lagou_tribal_leader",
      type: "passive",
      name: "Tribal Leader",
      description:
        "Heal yourself by 25% of max HP at the start of each round starting from round 2. This effect decreases by 5% every round.",
      tags: ["heal-self"],
    },
    {
      id: "lagou_responsibility",
      type: "awaken",
      name: "Responsibility",
      description:
        "Upon death, Stun all enemies in the front row for 2 turn(s) and reduce their DEF by 40% permanently.",
      tags: ["reduce-defense", "cc"],
    },
    {
      id: "lagou_engraving",
      type: "engraving",
      name: "Lagou's Engraving",
      description:
        "Increase the chances of Stunning of the Shield Slam by 10%. Upon Stunning the enemy for 3 times, you will recover 30% of max HP and be gigantified for 2 turns. Once gigantified, your ATK increases by 80%, while DEF increases by 50%. (Once per battle).",
      tags: ["cc"],
    },
    {
      id: "lagou_ancestors_shield",
      type: "exclusive-equipment",
      name: "Ancestor's Shield",
      description:
        "[Bull Rush] skill's required hit count is changed to 2. Each time Lagou stuns an enemy, permanently reduces that enemy's ATK and Crit Damage by 10% (Reduced stats persist after death).",
      tags: ["reduce-attack", "reduce-crit-damage"],
    },
  ],
};
