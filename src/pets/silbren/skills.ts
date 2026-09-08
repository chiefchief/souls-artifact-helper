import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const silbren: Pet = {
  id: "silbren",
  name: "Silbren",
  imageUrl: petImageUrl("silbren"),
  skills: [
    {
      id: "silbren_horn_of_hope",
      type: "active",
      name: "Horn of Hope",
      description:
        "Heals 3 allies with the lowest HP by 90% of ATK and has a 65% chance to remove CC status. (Prioritizes allies affected by CC)",
    },
    {
      id: "silbren_aurora_veil",
      type: "passive",
      name: "Aurora Veil",
      description: "Reduces damage taken by all allies from magic attacks by 20%.",
    },
  ],
};
