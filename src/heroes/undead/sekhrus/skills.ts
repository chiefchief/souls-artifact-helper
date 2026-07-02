import { heroImageUrl, type Hero } from "../../types";
export const sekhrus: Hero = {
  id: "sekhrus",
  name: "Sekhrus",
  rarity: "epic",
  race: "undead",
  role: "healer",
  attribute: "intelligence",
  imageUrl: heroImageUrl("undead", "sekhrus"),
  skills: [
    {
      id: "sekhrus_plague_onset",
      type: "active",
      name: "Plague Onset",
      description:
        "Attacks the nearest Healer hero, dealing 150% ATK as damage and inflicts Poison on the target and all adjacent enemy heroes, dealing 60% ATK as damage over 3 turns. (Defaults to primary target if no healer)\nSekhrus heals the ally with the lowest HP by 100% of all damage dealt by his own Poison.",
      tags: ["apply-dot", "heal-allies"],
    },
    {
      id: "sekhrus_poisoned_dagger",
      type: "passive",
      name: "Poisoned Dagger",
      description:
        "At the start of each round, inflict a debuff that reduces Speed by 20 for 1 turn on a random poisoned enemy hero.\n(Sekhrus starts with full Energy.)",
      tags: ["reduce-enemy-speed"],
    },
    {
      id: "sekhrus_crow_mask",
      type: "passive",
      name: "Crow Mask",
      description: "Sekhrus revives after 1 round with 50% HP and 100% Energy upon death. (Once per battle)",
      statBonus: [{ stat: "pen", value: 25 }],
      tags: ["revive-self"],
    },
    {
      id: "sekhrus_immunity",
      type: "passive",
      name: "Immunity",
      description: "Reduces damage taken by Sekhrus by 10% per poisoned enemy hero. (Max 30%)",
      tags: ["damage-reduction"],
    },
    {
      id: "sekhrus_death_sentence",
      type: "awaken",
      name: "Death Sentence",
      description:
        "When an ally's HP (excluding self) falls below 50%, activate the following effect: Instantly remove Sekhrus's Poison debuff from enemy heroes and deal damage equal to 100% of the total damage of the removed Poison debuff. Heal all allies by 100% of the damage dealt. (Activates 2 times per battle, does not activate if no enemy heroes are affected by Sekhrus's Poison.)",
      tags: ["heal-allies", "remove-dot"],
    },
    {
      id: "sekhrus_engraving",
      type: "engraving",
      name: "Sekhrus's Engraving",
      description:
        "At the start of each round, inflict Poison on a random enemy hero not already Poisoned, dealing 80% ATK as damage over 2 turns. (Applies after Poisoned Dagger skill activation.)\nAdditionally, when an enemy hero removes Poison, Sekhrus gains 25 Energy. (Once per round)",
      tags: ["apply-dot", "gain-energy"],
    },
  ],
};
