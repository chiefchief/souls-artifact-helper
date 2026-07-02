import { heroImageUrl, type Hero } from "../../types";
export const aruru: Hero = {
  id: "aruru",
  name: "Aruru",
  rarity: "epic",
  race: "horde",
  role: "healer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("horde", "aruru"),
  skills: [
    {
      id: "aruru_primitive_curse",
      type: "active",
      name: "Primitive Curse",
      description:
        "Deal ATK 215% damage to 1 enemy, and heal the ally with the lowest HP by 138% of the damage dealt. (This attack cannot be dodged)",
      tags: ["heal-allies"],
    },
    {
      id: "aruru_chaser",
      type: "passive",
      name: "Chaser",
      description: "Increase the Accuracy of yourself and adjacent allies by 40%.",
      tags: ["increase-self-accuracy", "increase-allies-accuracy"],
    },
    {
      id: "aruru_foresight",
      type: "passive",
      name: "Foresight",
      description: "When an enemy dies, obtain a buff that increases ATK by 20% for 2 turns.(1 time per round)",
      tags: ["increase-self-attack"],
    },
    {
      id: "aruru_shamanism",
      type: "passive",
      name: "Shamanism",
      description:
        "From round 2 to round 5, at the start of each round, heal the ally with the lowest HP by 110% of your ATK.",
      tags: ["heal-allies"],
    },
    {
      id: "aruru_high_priest",
      type: "awaken",
      name: "High Priest",
      description:
        "Upon death, deal ATK 140% damage to all enemies, and heal all allies by 34% of their max HP. (once per battle)",
      tags: ["heal-allies"],
    },
    {
      id: "aruru_engraving",
      type: "engraving",
      name: "Aruru's Engraving",
      description:
        "All attacks will ignore enemies' Shield and hit, and the opponent's Shield will be removed immediately. When the Shield is removed, all adjacent allies recover HP equal to 70% of damage dealt to enemy.",
      tags: ["anti-shield", "heal-allies"],
    },
  ],
};
