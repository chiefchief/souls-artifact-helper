import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const estelle: Pet = {
  id: "estelle",
  name: "Estelle",
  imageUrl: petImageUrl("estelle"),
  skills: [
    {
      id: "estelle_spinning_slash",
      type: "active",
      name: "Spinning Slash",
      description:
        "Deals physical damage equal to 150% of ATK to the two enemies with the highest Energy and reduces their Energy by 40.",
    },
    {
      id: "estelle_minds_eye",
      type: "passive",
      name: "Mind's Eye",
      description: "Increases the dodge rate of front-row allies by 30%.",
    },
  ],
};
