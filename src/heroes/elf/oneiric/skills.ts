import { heroImageUrl, type Hero } from "../../types";

export const oneiric: Hero = {
  id: "oneiric",
  name: "Oneiric",
  rarity: "epic",
  race: "elf",
  role: "dealer",
  attribute: "agility",
  imageUrl: heroImageUrl("elf", "oneiric"),
  skills: [
    {
      id: "oneiric_spirits_roar",
      type: "active",
      name: "Spirit's Roar",
      description: "Deals ATK 150% damage to all enemies in the back row and reduces their energy by 40.",
      tags: ["reduce-attack", "reduce-energy"],
    },
    {
      id: "oneiric_orb_of_darkness",
      type: "passive",
      name: "Orb of Darkness",
      description: "Normal attacks deal ATK 120% damage to the closest enemy in the back row and remove 1 buffs.",
      tags: ["remove-enemy-buff"],
    },
    {
      id: "oneiric_scent_of_death",
      type: "passive",
      name: "Scent of Death",
      description:
        "Increases ATK by 25% against enemies with less than 50% HP, and heals for 25% of damage dealt to enemies with less than 50% HP.",
      tags: ["heal-self"],
    },
    {
      id: "oneiric_satiation",
      type: "passive",
      name: "Satiation",
      description:
        "Each time [Orb of Darkness] or [Spirit's Feast] removes an enemy buff, increases ATK by 4% per buff removed.",
      tags: ["increase-self-attack"],
    },
    {
      id: "oneiric_spirits_feast",
      type: "awaken",
      name: "Spirit's Feast",
      description:
        "At the start of every 1 rounds, deals ATK 120% damage to all enemies with less than 50% HP and removes 1 buffs.",
      tags: ["remove-enemy-buff"],
    },
    {
      id: "oneiric_engraving",
      type: "engraving",
      name: "Oneiric's Engraving",
      description: "Increases attack by 20% against Intelligence-type enemies.",
      statBonus: [{ stat: "mres", value: 15 }],
      tags: [],
    },
    {
      id: "oneiric_key_of_liberation",
      type: "exclusive-equipment",
      name: "Key of Liberation",
      description:
        "Oneiric has a 100% chance to remove 1 buff from a target hit by his active skill. (Once per round, excluding bosses) When an enemy buff is removed by this effect, Oneiric gains 50 Energy and triggers the Satiation skill effect. (Once per round)",
      tags: ["gain-energy", "remove-enemy-buff"],
    },
  ],
};
