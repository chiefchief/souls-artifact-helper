/** Shared pet rules transcribed from the in-game Pets tips. */
export const petBattleRules = {
  energy: {
    gainTrigger: "allied-basic-attack",
    description: "Pets gain energy when allied heroes perform basic attacks.",
    additionalGainDescription: "Certain pets also gain additional energy under specific conditions.",
    activation: "immediate-on-full-energy",
    activationDescription: "Once fully charged, pets immediately use their active skill.",
    // The tips do not specify amounts, starting energy, or the activation threshold.
    energyPerBasicAttack: null,
    startingEnergy: null,
    activationThreshold: null,
  },
  skillPower: {
    source: "average-participating-hero-stats",
    description: "A pet's skill power is determined based on the average stats of the heroes participating in battle.",
  },
  canBeTargetedByEnemies: false,
  targetingDescription: "Pets serve as battle assistants and are not targeted by enemies.",
  statsDescription:
    "Pets deployed in battle increase the stats of all allied units deployed together. These bonuses increase with pet level.",
} as const;

/**
 * Shared bonus percentages supplied by the user. The corresponding pet level
 * has not been established; these are reference values, not a level-scaling formula.
 * Additional configurable pet bonuses belong to the counterpick project.
 */
export const petReferenceBonuses = {
  unit: "percent",
  level: null,
  atk: 18.36,
  def: 26.76,
  hp: 24.31,
} as const;
