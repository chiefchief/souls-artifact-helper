import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const spooky: Pet = {
  id: "spooky",
  name: "Spooky",
  imageUrl: petImageUrl("spooky"),
  skills: [
    {
      id: "spooky_sonic_attack",
      type: "active",
      name: "Sonic Attack",
      description:
        "Deals 160% magic damage to all enemies in the back row, and additionally has a 70% chance to Stun them for 1 turn.",
    },
    {
      id: "spooky_sound_detection",
      type: "passive",
      name: "Sound Detection",
      description: "Increases the dodge rate of allies placed in the third row by 30%.",
    },
  ],
};
