import { heroImageUrl, type Hero } from "../../types";
export const babu: Hero = {
  id: "babu",
  name: "Babu",
  rarity: "epic",
  race: "elf",
  role: "tanker",
  attribute: "strength",
  imageUrl: heroImageUrl("elf", "babu"),
  skills: [
    {
      id: "babu_violent_crash",
      type: "active",
      name: "Violent Crash",
      description:
        "Deal ATK 130% damage to 1 enemy and all adjacent enemies, and heal yourself by 100% of the all damage dealt.",
      tags: ["heal-self"],
    },
    {
      id: "babu_ground_slam",
      type: "passive",
      name: "Ground Slam",
      description:
        "ATK of normal attack increases by 50%.\nWhen using a normal attack, DEF and Crit DEF increases by 8%. (max 5 stacks)",
      tags: ["increase-self-defense"],
    },
    {
      id: "babu_golems_core",
      type: "passive",
      name: "Golem's Core",
      description:
        "When you or an ally is hit by a critical hit, you apply a Shield to each target equal to 16% of (Babu's) max HP for 2 turn(s). (5 times per battle)",
      statBonus: [{ stat: "crit_def", value: 35 }],
      tags: ["shield"],
    },
    {
      id: "babu_emblem_of_protection",
      type: "passive",
      name: "Emblem of Protection",
      description: "Heal yourself by 115% of the damage dealt on your normal attack.",
      statBonus: [{ stat: "hp", value: 10 }],
      tags: ["heal-self"],
    },
    {
      id: "babu_cruel_punishment",
      type: "awaken",
      name: "Cruel Punishment",
      description:
        "When hit by a critical hit, you Stun the enemy attacker for 1 turn(s), and gain an additional 50 Energy. (5 time(s) per battle)",
      tags: ["gain-energy", "cc"],
    },
    {
      id: "babu_engraving",
      type: "engraving",
      name: "Babu's Engraving",
      description:
        "When receiving Critical Strikes, apply a 22% Crit Rate increase buff to 1 random ally for 1 turns. ATK against agility-type enemies increases by 18%.",
      tags: [],
    },
    {
      id: "babu_ancient_rune_tablet",
      type: "exclusive-equipment",
      name: "Ancient Rune Tablet",
      description:
        "Babu's Crit Resistance is reduced by 100%, but he ignores damage proportional to Max HP and increases Crit Defense by 50%. When Babu is hit by a critical hit from a direct attack, there is a 50% chance to recover 10% HP and increase the Energy of the 2 allied heroes with the highest ATK by 20.",
      tags: ["give-energy", "heal-self", "increase-crit-resistance"],
    },
  ],
};
