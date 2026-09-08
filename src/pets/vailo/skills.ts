import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const vailo: Pet = {
  id: "vailo",
  name: "Vailo",
  imageUrl: petImageUrl("vailo"),
  skills: [
    {
      id: "vailo_whirlwind_wings",
      type: "active",
      name: "Whirlwind Wings",
      description:
        "Deals 270% physical damage to the enemy with the lowest HP and applies a 30% Crit Weaken debuff for 2 turns.",
    },
    {
      id: "vailo_weakness_detection",
      type: "passive",
      name: "Weakness Detection",
      description: "Increases Crit Damage of all allied Dealers by 30%",
    },
  ],
};
