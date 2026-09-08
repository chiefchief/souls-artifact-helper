import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const hamm: Pet = {
  id: "hamm",
  name: "Hamm",
  imageUrl: petImageUrl("hamm"),
  skills: [
    {
      id: "hamm_feast_of_treats",
      type: "active",
      name: "Feast of Treats",
      description:
        "Heals 3 allies with lowest HP by 110% of attack power and additionally removes 2 debuffs from the target.",
    },
    {
      id: "hamm_hamsters_fatal_snack",
      type: "passive",
      name: "Hamster's Fatal Snack",
      description: "Increases the Crit Rate of allies in the second row by 22%.",
    },
  ],
};
