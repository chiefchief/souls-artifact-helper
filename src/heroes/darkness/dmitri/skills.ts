import { heroImageUrl, type Hero } from "../../types";
export const dmitri: Hero = {
  id: "dmitri",
  name: "Dmitri",
  rarity: "epic",
  race: "darkness",
  role: "healer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("darkness", "dmitri"),
  skills: [
    {
      id: "dmitri_tranquillo",
      type: "active",
      name: "Tranquillo",
      description:
        "Heals all allies for 75% of ATK and applies continuous healing to the ally with the lowest HP, restoring 120% of ATK over 2 turns.",
      tags: ["heal-allies", "healing-over-time"],
    },
    {
      id: "dmitri_canzonetta",
      type: "passive",
      name: "Canzonetta",
      description: "At the start of battle, gain 100 Energy.",
      tags: ["gain-energy"],
    },
    {
      id: "dmitri_moderato",
      type: "passive",
      name: "Moderato",
      description:
        "From round 1 and at the start of every 2nd round thereafter, applies continuous healing to all allies, restoring 80% of ATK over 2 turns, and removes one debuff from 3 random allies.",
      tags: ["heal-allies", "healing-over-time", "remove-ally-debuff"],
    },
    {
      id: "dmitri_fermata",
      type: "passive",
      name: "Fermata",
      description:
        "Dmitri applies a debuff that reduces ATK by 20% for 2 turns to the attacker when he is hit.\n(Once per round)",
      tags: ["reduce-attack"],
    },

    {
      id: "dmitri_finale",
      type: "awaken",
      name: "Finale",
      description:
        "At the start of battle, if a total of 5 Dark and Undead heroes are deployed among allies, the following effect activates.\nAll allies except self gain 30 Energy at the start of each round. Additionally, when an ally (excluding self) dies, applies continuous healing to all remaining allies, restoring 80% of ATK over 2 turns, and when an ally is revived, applies a debuff to all enemies that reduces DEF by 40% for 2 turns and deals damage equal to 30% of their Max HP.\n(Death and revival effects each triggers once per battle)",
      tags: ["give-energy", "heal-allies", "healing-over-time", "reduce-defense"],
    },
    {
      id: "dmitri_engraving",
      type: "engraving",
      name: "Dmitri's Engraving",
      description:
        "At the start of battle, if a total of 3 or more Dark and Undead heroes were deployed among allies, the following effect activates.\nUntil round 5, when an ally with a continuous healing buff is about to take damage exceeding 35% of their Max HP from a single attack, that damage is limited to 35% of Max HP, and one continuous healing buff is removed.",
      tags: ["healing-over-time"],
    },
  ],
};
