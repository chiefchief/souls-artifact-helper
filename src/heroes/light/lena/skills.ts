import { heroImageUrl, type Hero } from "../../types";
export const lena: Hero = {
  id: "lena",
  name: "Lena",
  rarity: "epic",
  race: "light",
  role: "supporter",
  attribute: "intelligence",
  imageUrl: heroImageUrl("light", "lena"),
  skills: [
    {
      id: "lena_moonlight_flash",
      type: "active",
      name: "Moonlight Flash",
      description:
        "Deals damage equal to 105% of Attack to all enemies and has a 75% chance to put them to sleep for 1 turns.",
      tags: ["sleep"],
    },
    {
      id: "lena_meteor_shower",
      type: "passive",
      name: "Meteor Shower",
      description:
        "Normal attacks will additionally target 2 random enemies in a sleep state. Normal attack's Attack increases by 20%.",
      tags: [],
    },
    {
      id: "lena_moons_energy",
      type: "passive",
      name: "Moon's Energy",
      description:
        "At the end of the round, has a 100% chance to remove own inability to act and, if successful, gains a buff that increases Attack by 30% for 2 turns.",
      tags: ["remove-cc", "increase-self-attack"],
    },
    {
      id: "lena_magic_lena",
      type: "passive",
      name: "Magic Lena",
      description:
        "All allies, including oneself, adjacent to the caster, have their Magic Damage Reduction Rate increased by 50% at the start of battle. This effect decreases by 5% each round.",
      tags: ["damage-reduction"],
    },
    {
      id: "lena_dreamland",
      type: "awaken",
      name: "Dreamland",
      description:
        "When hit, there is a 70% chance to put the enemy to sleep for 1 turn. Lena recovers 20% of her maximum HP every 3 times she puts an enemy to sleep.",
      tags: ["sleep"],
    },
    {
      id: "lena_engraving",
      type: "engraving",
      name: "Lena's Engraving",
      description: "At the end of the round, reduces the energy of enemies in a sleep state by 50.",
      tags: ["reduce-energy"],
    },
  ],
};
