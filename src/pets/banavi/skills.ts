import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const banavi: Pet = {
  id: "banavi",
  name: "Banavi",
  imageUrl: petImageUrl("banavi"),
  skills: [
    {
      id: "banavi_dance_of_blessing",
      type: "active",
      name: "Dance of Blessing",
      description:
        "Grants a shield equal to 140% of ATK to the two allies with the lowest HP for 2 turns and applies continuous healing that restores 60% of ATK over 2 turns.",
    },
    {
      id: "banavi_brave_heart",
      type: "passive",
      name: "Brave Heart",
      description:
        "Increases Crit Resistance of allies in the 1st and 2nd rows by 30%. When an ally dies, increases Crit Resistance of the remaining allies by 15% for 2 turns.",
    },
  ],
};
