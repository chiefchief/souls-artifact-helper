import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const moko: Pet = {
  id: "moko",
  name: "Moko",
  imageUrl: petImageUrl("moko"),
  skills: [
    {
      id: "moko_petal_dance",
      type: "active",
      name: "Petal Dance",
      description:
        "Applies a debuff to the 2 enemies with the highest HP, increasing their damage taken by 15% and reducing their Dodge Rate by 20% for 1 turn.",
    },
    {
      id: "moko_life_force",
      type: "passive",
      name: "Life Force",
      description: "Increases the ATK of allied Intelligence Dealer Hero by 15%.",
    },
  ],
};
