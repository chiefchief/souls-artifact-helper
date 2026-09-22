import { heroImageUrl, type Hero } from "../../types";

export const maelin: Hero = {
  id: "maelin",
  name: "Maelin",
  rarity: "epic",
  race: "elf",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("elf", "maelin"),
  skills: [
    {
      id: "maelin_spirit_flame",
      type: "active",
      name: "Spirit Flame",
      description:
        "Attacks 3 enemies with the lowest HP for 120% ATK damage and inflicts a Spirit Flame debuff, reducing their Healing Received by 60% for 2 turn(s). (Spirit Flame debuff effects do not stack.)",
      tags: ["reduce-healing-received"],
    },
    {
      id: "maelin_resonance",
      type: "passive",
      name: "Resonance",
      description: "Attacks 2 enemies with the lowest HP, dealing 110% ATK damage.",
      tags: [],
    },
    {
      id: "maelin_harmony_of_life",
      type: "passive",
      name: "Harmony of Life",
      description: "At the start of battle, increases own Energy by 50.",
      tags: [],
      statBonus: [{ stat: "cc_res", value: 50 }],
    },
    {
      id: "maelin_spirits_blessing",
      type: "passive",
      name: "Spirit's Blessing",
      description: "Self and adjacent allies take 15% less damage from Normal Attacks.",
      tags: ["damage-reduction"],
    },
    {
      id: "maelin_spirit_pact",
      type: "awaken",
      name: "Spirit Pact",
      description:
        "When an enemy hero affected by the Spirit Flame debuff is hit by an Active Skill or Normal Attack, deals additional damage equal to 100% of ATK to the target. (Up to 3 times per round. Additional damage cannot exceed 20% of the target's Max HP.)",
      tags: [],
    },
    {
      id: "maelin_engraving",
      type: "engraving",
      name: "Maelin's Engraving",
      description:
        "When using an Active Skill, has a 70% chance to remove CC effects from 2 allies and increases their Energy by 25.",
      tags: ["remove-cc", "give-energy"],
    },
    {
      id: "maelin_twin_spirits",
      type: "exclusive-equipment",
      name: "Twin Spirits",
      description:
        "At the start of battle, grants self an unremovable Shield equal to 200% of ATK, and increases own Dodge Rate by 30% while this Shield is active.\nSeason Chapter Exclusive: Enemy heroes affected by the Spirit Flame debuff have their DEF reduced by 30%, and enemy heroes affected by Spirit Flame cannot be revived upon death.",
      tags: ["shield", "increase-self-dodge"],
    },
  ],
};
