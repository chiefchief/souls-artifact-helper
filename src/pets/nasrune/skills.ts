import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const nasrune: Pet = {
  id: "nasrune",
  name: "Nasrune",
  imageUrl: petImageUrl("nasrune"),
  skills: [
    {
      id: "nasrune_infernal_breath",
      type: "active",
      name: "Infernal Breath",
      description: "Breath attack all enemies, dealing 160% physical damage.",
    },
    {
      id: "nasrune_vitality_shield",
      type: "passive",
      name: "Vitality Shield",
      description:
        "Starting from round 2, at the start of every 3 rounds, grants a shield equal to 25% of target's max HP for 2 turns to 1 ally with lowest HP in the third row.",
    },
  ],
};
