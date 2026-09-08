import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const gladis: Pet = {
  id: "gladis",
  name: "Gladis",
  imageUrl: petImageUrl("gladis"),
  skills: [
    {
      id: "gladis_crystal_devourer",
      type: "active",
      name: "Crystal Devourer",
      description:
        "Deals 290% physical damage to an enemy with lowest HP and additionally reduces the target's energy by 50.",
    },
    {
      id: "gladis_crystal_aura",
      type: "passive",
      name: "Crystal Aura",
      description: "Reduces damage taken by all allies from magic attacks by 20%.",
    },
  ],
};
