import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const katatsu: Pet = {
  id: "katatsu",
  name: "Katatsu",
  imageUrl: petImageUrl("katatsu"),
  skills: [
    {
      id: "katatsu_frozen_crystal",
      type: "active",
      name: "Frozen Crystal",
      description:
        "Deals 200% ATK as Magic Damage to a random enemy in the back row and has a 100% chance to inflict Freeze for 1 turn. (Prioritizes back row enemies not under CC)",
    },
    {
      id: "katatsu_unmelting_ice",
      type: "passive",
      name: "Unmelting Ice",
      description: "Reduces all enemies' CC Resistance by 10%. Enemies under CC take 10% increased damage.",
    },
  ],
};
