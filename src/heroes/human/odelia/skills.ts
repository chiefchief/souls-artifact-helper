import { heroImageUrl, type Hero } from "../../types";

export const odelia: Hero = {
  id: "odelia",
  name: "Odelia",
  rarity: "epic",
  race: "human",
  role: "healer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("human", "odelia"),
  skills: [
    {
      id: "odelia_prayer_of_recovery",
      type: "active",
      name: "Prayer of Recovery",
      description: "Heal the ally with the lowest HP by ATK 300% and remove 2 debuff(s).",
      tags: ["heal-allies", "remove-ally-debuff"],
    },
    {
      id: "odelia_divine_power",
      type: "passive",
      name: "Divine Power",
      description: "Increase ATK of normal attacks by 30%. If the target enemy has HP above 70%, stun them for 1 turn.",
      tags: ["cc"],
    },
    {
      id: "odelia_sorcerous_aura",
      type: "passive",
      name: "Sorcerous Aura",
      description: "When HP is below 50%, Damage Taken reduces by 23%.",
      statBonus: [{ stat: "cc_res", value: 100 }],
      tags: ["damage-reduction"],
    },
    {
      id: "odelia_divine_protection",
      type: "passive",
      name: "Divine Protection",
      description:
        "100% of the excess healing amount is converted into a Shield for 2 turn(s).\nHealing amount increases by 30% at the start of battle. This effect decreases by 5% every round.",
      tags: [],
    },
    {
      id: "odelia_path_of_penance",
      type: "awaken",
      name: "Path of Penance",
      description:
        "When using an active skill, revives 1x random dead ally with 65% HP and 50% Energy. This effect only lasts until round 6. (1 time(s) per battle)",
      tags: ["revive-ally"],
    },
    {
      id: "odelia_engraving",
      type: "engraving",
      name: "Odelia's Engraving",
      description:
        "Upon resurrecting an ally, receive a Shield with 150% of ATK for an additional 2 turns.\nIf an ally resurrected by Odelia dies, all remaining allies recover HP by 100% of ATK.",
      tags: ["heal-allies", "heal-self", "revive-ally", "shield"],
    },
    {
      id: "odelia_noble_oath",
      type: "exclusive-equipment",
      name: "Noble Oath",
      description:
        "When healing an ally with a shield received from you, grant them a Crit Defense +15% buff for 1 turn.\nWhen using an Active Skill, heal all allies with Paladin's Ward buff except the target for 50% of ATK and remove 1 debuff.",
      tags: ["heal-allies", "remove-ally-debuff"],
    },
  ],
};
