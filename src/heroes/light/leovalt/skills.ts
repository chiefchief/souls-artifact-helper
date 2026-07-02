import { heroImageUrl, type Hero } from "../../types";
export const leovalt: Hero = {
  id: "leovalt",
  name: "Leovalt",
  rarity: "epic",
  race: "light",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("light", "leovalt"),
  skills: [
    {
      id: "leovalt_black_mask",
      type: "active",
      name: "Black Mask",
      description:
        "Deals 225% ATK damage to 1 enemy. If the active skill lands as a critical hit, the active skill is reused. (Up to 1 time)",
      tags: ["repeat-attack"],
    },
    {
      id: "leovalt_cursed_fist",
      type: "passive",
      name: "Cursed Fist",
      description:
        "ATK of normal attack increases by 23%. Leovalt's attacks leave a Darkness Seed debuff on the enemy for 1 turns. Enemies with Darkness Seed have a 20% increased chance of being hit by a critical hit and cannot be revived. (Non-stackable)",
      tags: ["prevent-revive"],
    },
    {
      id: "leovalt_brave__warrior",
      type: "passive",
      name: "Brave Warrior",
      description: "When health is below 60%, Crit Rate increases by 23%.",
      statBonus: [{ stat: "crit_rate", value: 24 }],
      tags: ["increase-self-crit-rate"],
    },
    {
      id: "leovalt_shining_in_darkness",
      type: "passive",
      name: "Shining in Darkness",
      description:
        "Removes 1 debuffs from yourself upon landing a critical hit and gains a shield equal to 15% of max HP for 2 turns.",
      tags: ["anti-shield", "remove-ally-debuff", "shield"],
    },
    {
      id: "leovalt_guide_of_darkness",
      type: "awaken",
      name: "Guide of Darkness",
      description:
        "Enemies killed by Leovalt cannot be revived. When an ally attacks an enemy in the 1st or 2nd row, there is a 40% chance to perform a joint attack, dealing 110% ATK as damage.",
      statBonus: [{ stat: "dodge_rate", value: 35 }],
      tags: ["join-attack", "prevent-revive"],
    },
    {
      id: "leovalt_engraving",
      type: "engraving",
      name: "Leovalt's Engraving",
      description:
        "Crit Damage against Tankers increases by 50%. Leovalt's attacks ignore all enemy shields and remove them. If the removed shield is a damage immunity shield, Leovalt gains a damage immunity shield for 1 turn.",
      tags: ["anti-shield", "shield"],
    },
  ],
};
