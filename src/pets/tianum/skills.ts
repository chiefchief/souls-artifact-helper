import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const tianum: Pet = {
  id: "tianum",
  name: "Tianum",
  imageUrl: petImageUrl("tianum"),
  skills: [
    {
      id: "tianum_magma_barrier",
      type: "active",
      name: "Magma Barrier",
      description:
        "Reduces damage taken by all allies by 30% for 1 turn and additionally increases 2 random ally's attack by 5% for 1 turn (stackable).",
    },
    {
      id: "tianum_power_surge",
      type: "passive",
      name: "Power Surge",
      description: "At the start of every odd-numbered round, increases a random ally's energy by 40.",
    },
  ],
};
