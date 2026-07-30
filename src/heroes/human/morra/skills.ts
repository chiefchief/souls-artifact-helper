import { heroImageUrl, type Hero } from "../../types";
export const morra: Hero = {
  id: "morra",
  name: "Morra",
  rarity: "epic",
  race: "human",
  role: "supporter",
  attribute: "strength",
  imageUrl: heroImageUrl("human", "morra"),
  skills: [
    {
      id: "morra_steel_anvil",
      type: "active",
      name: "Steel Anvil",
      description: "Applies a buff to all allies that reduces damage taken by 20% for 2 turn(s).",
      tags: ["damage-reduction"],
    },
    {
      id: "morra_hammer_throw",
      type: "passive",
      name: "Hammer Throw",
      description: "Until round 3, normal attacks have a 100% chance to stun enemies for 1 turn(s).",
      tags: ["cc"],
    },
    {
      id: "morra_plate_forging",
      type: "passive",
      name: "Plate Forging",
      description:
        "Increases Physical Resistance of all Strength-type allies by 10%, and increases their DEF by 5% at the start of each round. (Max 10 stacks)",
      tags: ["increase-allies-pres", "increase-allies-defense"],
    },
    {
      id: "morra_emergency_evacuation",
      type: "passive",
      name: "Emergency Evacuation",
      description:
        "If hit by a fatal attack, survives with 1 HP and gains a shield equal to 700% of DEF for 2 turn(s). (Once per battle)",
      tags: ["shield", "survive"],
    },
    {
      id: "morra_axe_sharpening",
      type: "awaken",
      name: "Axe Sharpening",
      description:
        "At the start of each round, increases ATK of the Strength-type ally with the highest ATK by 5%. (Max 10 stacks)",
      tags: ["increase-allies-attack"],
    },
    {
      id: "morra_engraving",
      type: "engraving",
      name: "Morra's Engraving",
      description:
        "Each time a Strength-type ally dies, the ATK and DEF of remaining Strength-type allies increase by 15%. (Only active while Morra is alive.)",
      tags: ["increase-allies-defense"],
    },
    {
      id: "morra_unyielding_hammer",
      type: "exclusive-equipment",
      name: "Unyielding Hammer",
      description:
        "If there are 5 or more Strength-type allied heroes, the following effect activates: At the start of battle, reduce the Physical Resistance  of all enemies by 20%. When Morra uses an Active Skill, heals the 3 allies with lowest HP by 150% of her own DEF.",
      tags: ["reduce-pres", "heal-allies"],
    },
  ],
};
