import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const romaelle: Pet = {
  id: "romaelle",
  name: "Romaelle",
  imageUrl: petImageUrl("romaelle"),
  skills: [
    {
      id: "romaelle_flash_dash",
      type: "active",
      name: "Flash Dash",
      description:
        "Deals 215% physical damage to 1 enemy with lowest HP in the front row and all enemies directly behind it, and additionally reduces their speed by 15 for 2 turns.",
    },
    {
      id: "romaelle_hoof_strike",
      type: "passive",
      name: "Hoof Strike",
      description: "Reduces damage taken by all allies from physical attacks by 20%.",
    },
  ],
};
