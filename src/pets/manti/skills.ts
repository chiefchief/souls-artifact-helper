import { petImageUrl } from "../helpers";
import { type Pet } from "../types";

export const manti: Pet = {
  id: "manti",
  name: "Manti",
  imageUrl: petImageUrl("manti"),
  skills: [
    {
      id: "manti_song_of_the_tides",
      type: "active",
      name: "Song of the Tides",
      description: "Restores HP to all allies equal to 50% of ATK and increases their Energy by 25.",
    },
    {
      id: "manti_mantis_gem",
      type: "passive",
      name: "Manti's Gem",
      description: "Increases CC Resistance of allies in the 3rd row by 30%.",
    },
  ],
};
