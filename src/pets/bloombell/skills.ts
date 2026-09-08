import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const bloombell: Pet = {
  id: "bloombell",
  name: "Bloombell",
  imageUrl: petImageUrl("bloombell"),
  skills: [
    {
      id: "bloombell_ram_booster",
      type: "active",
      name: "Ram Booster",
      description:
        "Deals 195% magic damage to the enemy with the lowest health. Additionally, reduces the target's defense by 15%. (Up to 3 stacks)",
    },
    {
      id: "bloombell_target_on",
      type: "passive",
      name: "Target On",
      description: "Increases the accuracy of 3 allies with the highest attack by 20%.",
    },
  ],
};
