import { heroImageUrl, type Hero } from "../../types";
export const louveti: Hero = {
  id: "louveti",
  name: "Louveti",
  rarity: "epic",
  race: "undead",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("undead", "louveti"),
  skills: [
    {
      id: "louveti_annihilation_round",
      type: "active",
      name: "Anihilation Round",
      description:
        "Attacks the nearest enemy in the back row, dealing 185% of ATK as damage and inflicts a Shield Prevention debuff for 2 turns, preventing all shield gains. Additionally deals 130% damage to adjacent enemies.",
      tags: ["anti-shield"],
    },
    {
      id: "louveti_precision_shot",
      type: "passive",
      name: "Precision Shot",
      description: "Deals 140% of ATK as damage to the nearest enemy in the back row.",
      tags: [],
    },
    {
      id: "louveti_aim",
      type: "passive",
      name: "Aim",
      description:
        "When attacking, Louveti absorb 10~30 Energy from all enemy heroes hit by a Critical hit. (Once per round)",
      tags: ["absorb-energy"],
    },
    {
      id: "louveti_moonlight_aura",
      type: "passive",
      name: "Moonlight Aura",
      description: "At the start of every 2 rounds, gains a Shield equal to 20% of HP for 2 turn(s)",
      tags: ["shield"],
    },
    {
      id: "louveti_sharp_senses",
      type: "awaken",
      name: "Sharp Senses",
      description:
        "Immediately removes all debuffs and CC effect from self when current HP falls to 50% or below, and applies a continuous healing that restore HP equal to 300% of ATK for 1 turn. (Once per battle)",
      tags: ["remove-self-debuff", "remove-cc", "healing-over-time"],
    },
    {
      id: "louveti_engraving",
      type: "engraving",
      name: "Louveti's Engraving",
      description:
        "Crit rate against Strength and Agility-type enemies increase by 25%. Additionally, Crit Damage against enemies with shields increases by 50%",
      tags: ["increase-self-crit-rate", "increase-self-crit-damage"],
    },
    {
      id: "louveti_silver_bullet",
      type: "exclusive-equipment",
      name: "Silver Bullet",
      description:
        "When attacking, Louveti's Accuracy increases by 20% for each buff applied to her. (Max 40%)\nSeason Chapter Exclusive: Increases damage dealt by 10% for each debuff on the target when attacking. (Max 20%)",
      tags: ["increase-self-accuracy"],
    },
  ],
};
