import { heroImageUrl, type Hero } from "../../types";
export const naru: Hero = {
  id: "naru",
  name: "Naru",
  rarity: "epic",
  race: "horde",
  role: "healer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("horde", "naru"),
  skills: [
    {
      id: "naru_beads_of_healing",
      type: "active",
      name: "Beads of Healing",
      description:
        "Heal 2 allies with low HP by ATK 205%. If the target is under CC, release them and increase the Energy of the target by 50.",
      tags: ["heal-allies", "remove-cc", "give-energy"],
    },
    {
      id: "naru_beads_of_spirit",
      type: "passive",
      name: "Beads of Spirit",
      description:
        "Normal attack deals ATK 85% damage to all enemies in the front row, and it heals the ally with the lowest HP by 65% of the damage dealt.",
      tags: ["heal-allies"],
    },
    {
      id: "naru_guardian_of_balance",
      type: "passive",
      name: "Guardian of Balance",
      description: "When allies fall under CC, you heal their HP by 85% of your ATK.",
      statBonus: [{ stat: "cc_res", value: 100 }],
      tags: ["heal-allies"],
    },
    {
      id: "naru_natures_vitality",
      type: "passive",
      name: "Nature's Vitality",
      description:
        "When you critically heal with an active skill, apply a buff to the target that increases DEF by 30% for 2 turn(s).",
      tags: ["increase-allies-defense"],
    },
    {
      id: "naru_spirit_of_harmony",
      type: "awaken",
      name: "Spirit of Harmony",
      description:
        "Crit Rate increases by 13% for each ally Horde hero. Whenever an ally dies, Crit Rate increases additionally by 13%.",
      tags: ["increase-self-crit-rate"],
    },
    {
      id: "naru_engraving",
      type: "engraving",
      name: "Naru's Engraving",
      description:
        "Increase Healing amount of Active Skill by 20%. Every time you heal an ally with Active Skill, the Healing received by that ally permanently increases by 10%.",
      tags: ["increase-healing-received"],
    },
    {
      id: "naru_guardians_staff",
      type: "exclusive-equipment",
      name: "Guardian's Staff",
      description:
        "Naru gains 25 Energy when removing CC effects from an allied hero. (Once per round)\nSpirit of Harmony applies to all allied Horde heroes.\nFor every 3 time(s) CC effects are applied to allies, Naru removes CC effects from all affected allies and grants them ATK +20% for 2 turns. (Does not trigger if CC is resisted.)",
      tags: ["gain-energy", "increase-allies-attack", "remove-cc"],
    },
  ],
};
