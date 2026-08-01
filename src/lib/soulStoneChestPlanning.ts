export type ChestPlanMode = "min-overuse" | "balanced";

export type ChestPlanningOption = {
  available: number;
  value: number;
};

type SelectionState = {
  counts: number[];
  selectedCount: number;
};

type BalancedSelectionState = SelectionState & {
  score: number;
};

const BALANCED_OVERFLOW_TO_ONE_HOUR_CHEST_RATIO = 0.8;
const SCORE_EPSILON = 1e-12;

export function findOptimalChestUsage(deficit: number, chests: ChestPlanningOption[], mode: ChestPlanMode) {
  if (!Number.isInteger(deficit) || deficit <= 0 || chests.length === 0) {
    return null;
  }

  const normalizedChests = chests.map((chest) => ({
    available: Math.max(0, Math.floor(chest.available)),
    value: Math.max(0, Math.floor(chest.value)),
  }));
  const totalAvailable = getSelectionValue(
    normalizedChests.map((chest) => chest.available),
    normalizedChests,
  );

  if (totalAvailable < deficit || normalizedChests.some((chest) => chest.value <= 0)) {
    return null;
  }

  return mode === "balanced"
    ? solveBalancedUsage(deficit, normalizedChests)
    : solveMinimalUsage(deficit, normalizedChests);
}

export function solveMinimalUsage(deficit: number, chests: ChestPlanningOption[]) {
  const totalAvailable = getSelectionValue(
    chests.map((chest) => chest.available),
    chests,
  );
  if (deficit <= 0 || totalAvailable < deficit) {
    return null;
  }

  const unusedCapacity = totalAvailable - deficit;
  const maxChestValue = Math.max(...chests.map((chest) => chest.value));
  const directCapacity = Math.min(totalAvailable, deficit + maxChestValue - 1);

  if (unusedCapacity < directCapacity) {
    const unusedStates = enumerateCountOptimalStates(unusedCapacity, chests, "maximum");
    const bestUnusedSum = getLargestReachableSum(unusedStates, unusedCapacity);
    const unusedCounts = unusedStates.get(bestUnusedSum)?.counts;
    return unusedCounts ? chests.map((chest, index) => chest.available - unusedCounts[index]) : null;
  }

  const usedStates = enumerateCountOptimalStates(directCapacity, chests, "minimum");
  const bestUsedSum = getSmallestReachableSum(usedStates, deficit, directCapacity);
  return usedStates.get(bestUsedSum)?.counts ?? null;
}

export function solveBalancedUsage(deficit: number, chests: ChestPlanningOption[]) {
  const totalAvailable = getSelectionValue(
    chests.map((chest) => chest.available),
    chests,
  );
  if (deficit <= 0 || totalAvailable < deficit) {
    return null;
  }

  const minUsage = solveMinimalUsage(deficit, chests);
  if (!minUsage) {
    return null;
  }

  const minOverflow = getSelectionValue(minUsage, chests) - deficit;
  const oneHourChestValue = chests[0]?.value ?? 0;
  const overflowLimit = Math.max(
    minOverflow,
    Math.floor(oneHourChestValue * BALANCED_OVERFLOW_TO_ONE_HOUR_CHEST_RATIO),
  );
  const unusedCapacity = totalAvailable - deficit;
  const directCapacity = Math.min(totalAvailable, deficit + overflowLimit);
  const totalChestCount = chests.reduce((sum, chest) => sum + chest.available, 0);

  if (unusedCapacity < directCapacity) {
    const targetUnusedFraction = unusedCapacity / totalAvailable;
    const unusedStates = enumerateBalancedStates(unusedCapacity, chests, targetUnusedFraction, "maximum");
    const minimumUnusedSum = Math.max(0, unusedCapacity - overflowLimit);
    const bestUnused = selectBestBalancedState(
      unusedStates,
      minimumUnusedSum,
      unusedCapacity,
      (sum) => unusedCapacity - sum,
      (state) => totalChestCount - state.selectedCount,
    );

    return bestUnused ? chests.map((chest, index) => chest.available - bestUnused.state.counts[index]) : null;
  }

  const targetUsedFraction = deficit / totalAvailable;
  const usedStates = enumerateBalancedStates(directCapacity, chests, targetUsedFraction, "minimum");
  const bestUsed = selectBestBalancedState(
    usedStates,
    deficit,
    Math.min(directCapacity, deficit + overflowLimit),
    (sum) => sum - deficit,
    (state) => state.selectedCount,
  );
  return bestUsed?.state.counts ?? null;
}

function enumerateCountOptimalStates(
  capacity: number,
  chests: ChestPlanningOption[],
  countPreference: "minimum" | "maximum",
) {
  let states = new Map<number, SelectionState>();
  states.set(0, {
    counts: chests.map(() => 0),
    selectedCount: 0,
  });

  chests.forEach((chest, chestIndex) => {
    const next = new Map(states);
    const snapshot = Array.from(states.entries());

    snapshot.forEach(([sum, state]) => {
      const maxUsable = Math.min(chest.available, Math.floor((capacity - sum) / chest.value));
      for (let used = 1; used <= maxUsable; used += 1) {
        const nextSum = sum + used * chest.value;
        const selectedCount = state.selectedCount + used;
        const existing = next.get(nextSum);
        const isBetterCount =
          countPreference === "minimum"
            ? selectedCount < (existing?.selectedCount ?? Number.POSITIVE_INFINITY)
            : selectedCount > (existing?.selectedCount ?? Number.NEGATIVE_INFINITY);

        if (!existing || isBetterCount) {
          const counts = [...state.counts];
          counts[chestIndex] = used;
          next.set(nextSum, { counts, selectedCount });
        }
      }
    });

    states = next;
  });

  return states;
}

function enumerateBalancedStates(
  capacity: number,
  chests: ChestPlanningOption[],
  targetFraction: number,
  countPreference: "minimum" | "maximum",
) {
  const initialScore = chests.reduce((score, chest) => score + (chest.available > 0 ? targetFraction : 0), 0);
  let states = new Map<number, BalancedSelectionState>();
  states.set(0, {
    counts: chests.map(() => 0),
    score: initialScore,
    selectedCount: 0,
  });

  chests.forEach((chest, chestIndex) => {
    const next = new Map(states);
    const snapshot = Array.from(states.entries());
    const unusedPenalty = chest.available > 0 ? targetFraction : 0;

    snapshot.forEach(([sum, state]) => {
      const maxUsable = Math.min(chest.available, Math.floor((capacity - sum) / chest.value));
      for (let used = 1; used <= maxUsable; used += 1) {
        const nextSum = sum + used * chest.value;
        const selectedCount = state.selectedCount + used;
        const score = state.score - unusedPenalty + Math.abs(used / chest.available - targetFraction);
        const existing = next.get(nextSum);

        if (
          !existing ||
          score < existing.score - SCORE_EPSILON ||
          (Math.abs(score - existing.score) <= SCORE_EPSILON &&
            isPreferredCount(selectedCount, existing.selectedCount, countPreference))
        ) {
          const counts = [...state.counts];
          counts[chestIndex] = used;
          next.set(nextSum, { counts, score, selectedCount });
        }
      }
    });

    states = next;
  });

  return states;
}

function selectBestBalancedState(
  states: Map<number, BalancedSelectionState>,
  minimumSum: number,
  maximumSum: number,
  getOverflow: (sum: number) => number,
  getUsedChestCount: (state: BalancedSelectionState) => number,
): { sum: number; state: BalancedSelectionState } | null {
  let best: { sum: number; state: BalancedSelectionState } | null = null;

  for (const [sum, state] of states) {
    if (sum < minimumSum || sum > maximumSum) {
      continue;
    }

    if (
      !best ||
      state.score < best.state.score - SCORE_EPSILON ||
      (Math.abs(state.score - best.state.score) <= SCORE_EPSILON &&
        (getOverflow(sum) < getOverflow(best.sum) ||
          (getOverflow(sum) === getOverflow(best.sum) && getUsedChestCount(state) < getUsedChestCount(best.state))))
    ) {
      best = { sum, state };
    }
  }

  return best;
}

function isPreferredCount(candidate: number, existing: number, preference: "minimum" | "maximum") {
  return preference === "minimum" ? candidate < existing : candidate > existing;
}

function getSmallestReachableSum(states: Map<number, SelectionState>, minimum: number, maximum: number) {
  let best = Number.POSITIVE_INFINITY;
  states.forEach((_state, sum) => {
    if (sum >= minimum && sum <= maximum && sum < best) {
      best = sum;
    }
  });
  return best;
}

function getLargestReachableSum(states: Map<number, SelectionState>, maximum: number) {
  let best = 0;
  states.forEach((_state, sum) => {
    if (sum <= maximum && sum > best) {
      best = sum;
    }
  });
  return best;
}

export function getSelectionValue(counts: number[], chests: ChestPlanningOption[]) {
  return counts.reduce((sum, count, index) => sum + count * chests[index].value, 0);
}
