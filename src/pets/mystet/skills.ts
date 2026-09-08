import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const mystet: Pet = {
  id: "mystet",
  name: "Mystet",
  imageUrl: petImageUrl("mystet"),
  skills: [
    {
      id: "mystet_cheeky_blow",
      type: "active",
      name: "Cheeky Blow",
      description: "Deals 145% ATK as magic damage to the 2 enemies with the highest ATK and removes 2 buffs.",
    },
    {
      id: "mystet_shh_just_a_moment",
      type: "passive",
      name: "Shh, Just a Moment~",
      description:
        "At the start of each round, there is a 60% chance to inflict Silence for 1 turn to the enemy with the highest energy.",
    },
  ],
};
