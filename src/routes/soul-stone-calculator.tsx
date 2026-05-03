import { Link, createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/soul-stone-calculator")({
  component: SoulStoneCalculatorPage,
});

type SoulStoneChest = {
  id: string;
  name: string;
  hours: number;
  imageUrl: string;
};
type ChestPlanItem = {
  chestId: string;
  chestName: string;
  chestImageUrl: string;
  chestHours: number;
  used: number;
  available: number;
  perChestValue: number;
  totalValue: number;
};
type ChestPlanResult = {
  items: ChestPlanItem[];
  addedSoulStones: number;
  finalSoulStones: number;
  overflowAfterRequirement: number;
};

const SOUL_STONE_CALC_STORAGE_KEY = "souls_soul_stone_calculator_v1";
const SOUL_STONE_CHAPTER_STORAGE_KEY = "souls_soul_stone_chapter_v1";
const SOUL_STONE_CURRENT_STORAGE_KEY = "souls_soul_stone_current_v1";
const SOUL_STONE_REQUIRED_STORAGE_KEY = "souls_soul_stone_required_v1";
const SOUL_STONE_HIDDEN_COEFFICIENT = 1.08475;
const MIN_CHAPTER = 40;
const MIN_LEVEL = 1;
const MAX_CHAPTER = 76;
const MAX_LEVEL = 60;
const soulStoneChests: SoulStoneChest[] = [
  {
    id: "chest-1h",
    name: "Soul Stone 1 Hour Chest",
    hours: 1,
    imageUrl: `${import.meta.env.BASE_URL}artifacts/soulStoneChests/soul-stone-chest-1h.png`,
  },
  {
    id: "chest-3h",
    name: "Soul Stone 3 Hour Chest",
    hours: 3,
    imageUrl: `${import.meta.env.BASE_URL}artifacts/soulStoneChests/soul-stone-chest-3h.png`,
  },
  {
    id: "chest-6h",
    name: "Soul Stone 6 Hour Chest",
    hours: 6,
    imageUrl: `${import.meta.env.BASE_URL}artifacts/soulStoneChests/soul-stone-chest-6h.png`,
  },
  {
    id: "chest-12h",
    name: "Soul Stone 12 Hour Chest",
    hours: 12,
    imageUrl: `${import.meta.env.BASE_URL}artifacts/soulStoneChests/soul-stone-chest-12h.png`,
  },
  {
    id: "chest-24h",
    name: "Soul Stone 24 Hour Chest",
    hours: 24,
    imageUrl: `${import.meta.env.BASE_URL}artifacts/soulStoneChests/soul-stone-chest-24h.png`,
  },
];

function SoulStoneCalculatorPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [chapterInput, setChapterInput] = useState("");
  const [currentSoulStonesInput, setCurrentSoulStonesInput] = useState("");
  const [requiredSoulStonesInput, setRequiredSoulStonesInput] = useState("");
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);
  const [planResult, setPlanResult] = useState<ChestPlanResult | null>(null);
  const [planMessage, setPlanMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const serialized = window.localStorage.getItem(SOUL_STONE_CALC_STORAGE_KEY);
    if (serialized) {
      try {
        const parsed = JSON.parse(serialized) as Record<string, unknown>;
        const normalized = Object.fromEntries(
          Object.entries(parsed)
            .map(([key, value]) => [key, Number(value)] as const)
            .filter(([, value]) => Number.isFinite(value) && value > 0),
        ) as Record<string, number>;
        setQuantities(normalized);
      } catch {
        // ignore malformed storage payload
      }
    }

    const storedChapter = window.localStorage.getItem(SOUL_STONE_CHAPTER_STORAGE_KEY);
    if (storedChapter) {
      setChapterInput(storedChapter);
    }

    const storedCurrent = window.localStorage.getItem(SOUL_STONE_CURRENT_STORAGE_KEY);
    const storedRequired = window.localStorage.getItem(SOUL_STONE_REQUIRED_STORAGE_KEY);
    if (storedCurrent) {
      setCurrentSoulStonesInput(storedCurrent);
    }
    if (storedRequired) {
      setRequiredSoulStonesInput(storedRequired);
    }

    setIsStorageHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!isStorageHydrated) {
      return;
    }

    window.localStorage.setItem(SOUL_STONE_CALC_STORAGE_KEY, JSON.stringify(quantities));
  }, [isStorageHydrated, quantities]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!isStorageHydrated) {
      return;
    }

    window.localStorage.setItem(SOUL_STONE_CHAPTER_STORAGE_KEY, chapterInput);
  }, [chapterInput, isStorageHydrated]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!isStorageHydrated) {
      return;
    }

    window.localStorage.setItem(SOUL_STONE_CURRENT_STORAGE_KEY, currentSoulStonesInput);
  }, [currentSoulStonesInput, isStorageHydrated]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!isStorageHydrated) {
      return;
    }

    window.localStorage.setItem(SOUL_STONE_REQUIRED_STORAGE_KEY, requiredSoulStonesInput);
  }, [isStorageHydrated, requiredSoulStonesInput]);

  const chapterValidation = useMemo(() => validateChapterInput(chapterInput), [chapterInput]);
  const chapterIndex = useMemo(() => {
    if (!chapterValidation.valid || !chapterValidation.parsed) {
      return null;
    }

    return getSoulStoneIndex(chapterValidation.parsed.chapter, chapterValidation.parsed.level);
  }, [chapterValidation]);

  const currentSoulStones = parseNonNegativeNumber(currentSoulStonesInput);
  const requiredSoulStones = parseNonNegativeNumber(requiredSoulStonesInput);
  const remainingSoulStones =
    currentSoulStones !== null && requiredSoulStones !== null
      ? Math.max(requiredSoulStones - currentSoulStones, 0)
      : null;
  const totalPossibleFromAllChests = useMemo(() => {
    if (chapterIndex === null) {
      return null;
    }

    return soulStoneChests.reduce((sum, chest) => {
      const quantity = quantities[chest.id] ?? 0;
      const perChest = Math.floor(
        chapterIndex * SOUL_STONE_HIDDEN_COEFFICIENT * chest.hours,
      );
      return sum + quantity * perChest;
    }, 0);
  }, [chapterIndex, quantities]);

  function setQuantity(chestId: string, nextQuantity: number) {
    if (!Number.isFinite(nextQuantity) || nextQuantity < 0) {
      return;
    }

    const normalized = Math.floor(nextQuantity);
    setQuantities((current) => {
      const next = { ...current };
      if (normalized <= 0) {
        delete next[chestId];
      } else {
        next[chestId] = normalized;
      }
      return next;
    });
  }

  function resetQuantity(chestId: string) {
    setQuantities((current) => {
      const next = { ...current };
      delete next[chestId];
      return next;
    });
  }

  function resetAll() {
    setQuantities({});
    setChapterInput("");
    setCurrentSoulStonesInput("");
    setRequiredSoulStonesInput("");
    setPlanResult(null);
    setPlanMessage(null);
  }

  function calculateChestPlan() {
    setPlanResult(null);

    if (!chapterValidation.valid || chapterIndex === null) {
      setPlanMessage("Enter a valid chapter first.");
      return;
    }

    if (currentSoulStones === null || requiredSoulStones === null) {
      setPlanMessage("Enter both current and required soul stones.");
      return;
    }

    const deficit = requiredSoulStones - currentSoulStones;
    if (deficit <= 0) {
      setPlanMessage("Requirement already reached. No chests needed.");
      return;
    }

    const chestsWithValues = soulStoneChests.map((chest) => ({
      ...chest,
      available: quantities[chest.id] ?? 0,
      value: Math.floor(chapterIndex * SOUL_STONE_HIDDEN_COEFFICIENT * chest.hours),
    }));

    const totalAvailableSoulStones = chestsWithValues.reduce(
      (sum, chest) => sum + chest.available * chest.value,
      0,
    );

    if (totalAvailableSoulStones < deficit) {
      setPlanMessage(
        `Not enough chests. Missing ${(
          deficit - totalAvailableSoulStones
        ).toLocaleString("en-US")} soul stones.`,
      );
      return;
    }

    const usedCounts = findOptimalChestUsage(deficit, chestsWithValues);
    if (!usedCounts) {
      setPlanMessage("Could not find a valid chest combination for this target.");
      return;
    }

    const items = chestsWithValues.map((chest, index) => {
      const used = usedCounts[index] ?? 0;
      const totalValue = used * chest.value;
      return {
        chestId: chest.id,
        chestName: chest.name,
        chestImageUrl: chest.imageUrl,
        chestHours: chest.hours,
        used,
        available: chest.available,
        perChestValue: chest.value,
        totalValue,
      };
    });

    const addedSoulStones = items.reduce((sum, item) => sum + item.totalValue, 0);
    const finalSoulStones = currentSoulStones + addedSoulStones;
    const overflowAfterRequirement = finalSoulStones - requiredSoulStones;

    setPlanMessage(null);
    setPlanResult({
      items,
      addedSoulStones,
      finalSoulStones,
      overflowAfterRequirement,
    });
  }

  return (
    <main className="min-h-screen bg-souls-void text-souls-parchment">
      <section className="hero-shell min-h-screen py-4">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <nav className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded border border-souls-spirit/30 bg-souls-spirit/10">
                <img
                  alt="Souls icon"
                  className="size-6 object-contain"
                  src={`${import.meta.env.BASE_URL}brand/favicon.png`}
                />
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-souls-panel">
                Souls Artifacts
              </span>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Link
                className="rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                to="/"
              >
                Artifacts
              </Link>
              <Link
                className="rounded border border-souls-gold bg-souls-gold px-3 py-1.5 text-sm font-medium text-souls-void"
                to="/soul-stone-calculator"
              >
                Soul Stone Calculator
              </Link>
            </div>
          </nav>

          <section className="artifact-preview p-4 md:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-souls-spirit/20 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-souls-spirit">
                  Calculator
                </p>
                <h1 className="mt-1 text-3xl font-black text-souls-parchment md:text-4xl">
                  Soul Stone Calculator
                </h1>
              </div>
              <button
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded border border-souls-ember/30 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-ember hover:bg-souls-ember hover:text-souls-void"
                onClick={resetAll}
                type="button"
              >
                <RotateCcw className="size-4" />
                Reset all
              </button>
            </div>

            <div className="mt-4 rounded border border-souls-spirit/20 bg-souls-void/45 p-3">
              <div className="flex flex-col gap-2">
                <div className="max-w-xl">
                  <p className="text-xs uppercase tracking-[0.12em] text-souls-spirit">
                    Current chapter
                  </p>
                  <p className="mt-1 text-sm text-souls-panel">
                    Enter format <strong>chapter-level</strong>, range{" "}
                    <strong>
                      {MIN_CHAPTER}-{MIN_LEVEL}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {MAX_CHAPTER}-{MAX_LEVEL}
                    </strong>
                    .
                  </p>
                </div>
                <input
                  className="min-h-9 w-full max-w-[220px] rounded border border-souls-spirit/25 bg-souls-void/65 px-3 text-sm text-souls-parchment outline-none placeholder:text-souls-panel/55 focus:border-souls-spirit"
                  onChange={(event) => setChapterInput(event.target.value)}
                  placeholder="40-1"
                  value={chapterInput}
                />
              </div>
              <p
                className={`mt-2 text-sm ${
                  chapterValidation.valid ? "text-souls-leaf" : "text-souls-ember"
                }`}
              >
                {chapterValidation.valid ? "Valid chapter." : chapterValidation.message}
              </p>
            </div>

            <div className="mt-4 rounded border border-souls-spirit/20 bg-souls-void/45 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-[0.12em] text-souls-spirit">
                    Current soul stones
                  </span>
                  <input
                    className="min-h-9 rounded border border-souls-spirit/25 bg-souls-void/65 px-3 text-sm text-souls-parchment outline-none placeholder:text-souls-panel/55 focus:border-souls-spirit"
                    inputMode="numeric"
                    min="0"
                    onChange={(event) => setCurrentSoulStonesInput(event.target.value)}
                    placeholder="53421"
                    type="number"
                    value={currentSoulStonesInput}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-[0.12em] text-souls-spirit">
                    Required soul stones
                  </span>
                  <input
                    className="min-h-9 rounded border border-souls-spirit/25 bg-souls-void/65 px-3 text-sm text-souls-parchment outline-none placeholder:text-souls-panel/55 focus:border-souls-spirit"
                    inputMode="numeric"
                    min="0"
                    onChange={(event) => setRequiredSoulStonesInput(event.target.value)}
                    placeholder="80000"
                    type="number"
                    value={requiredSoulStonesInput}
                  />
                </label>
              </div>
              <p className="mt-2 text-sm text-souls-panel">
                {remainingSoulStones === null
                  ? "Enter both values to calculate remaining soul stones."
                  : remainingSoulStones > 0
                    ? `Remaining needed: ${remainingSoulStones.toLocaleString("en-US")}`
                    : "Requirement reached."}
              </p>
              <p className="mt-1 text-sm text-souls-spirit">
                {totalPossibleFromAllChests === null
                  ? "Set a valid chapter to see total possible from all chests."
                  : `Total possible from all chests: ${totalPossibleFromAllChests.toLocaleString("en-US")}`}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {soulStoneChests.map((chest) => (
                <SoulStoneChestCard
                  chest={chest}
                  key={chest.id}
                  onSetQuantity={setQuantity}
                  onResetQuantity={resetQuantity}
                  perChestSoulStones={
                    chapterIndex === null
                      ? null
                      : chapterIndex * SOUL_STONE_HIDDEN_COEFFICIENT * chest.hours
                  }
                  quantity={quantities[chest.id] ?? 0}
                />
              ))}
            </div>

            <div className="mt-4 rounded border border-souls-spirit/20 bg-souls-void/45 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="rounded border border-souls-gold bg-souls-gold px-3 py-1.5 text-sm font-semibold text-souls-void transition hover:brightness-95"
                  onClick={calculateChestPlan}
                  type="button"
                >
                  Calculate plan
                </button>
                {planMessage ? (
                  <span className="text-sm text-souls-ember">{planMessage}</span>
                ) : null}
              </div>

              {planResult ? (
                <div className="mt-3 space-y-2">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <StatCard
                      label="Added soul stones"
                      value={planResult.addedSoulStones.toLocaleString("en-US")}
                    />
                    <StatCard
                      label="Final soul stones"
                      value={planResult.finalSoulStones.toLocaleString("en-US")}
                    />
                    <StatCard
                      label="Extra after target"
                      value={planResult.overflowAfterRequirement.toLocaleString("en-US")}
                    />
                  </div>
                  <div className="rounded border border-souls-spirit/18 bg-souls-void/45 p-2">
                    <p className="text-xs uppercase tracking-[0.12em] text-souls-spirit">
                      Chest usage plan
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
                      {planResult.items.map((item) => (
                        <div
                          className="rounded border border-souls-spirit/18 bg-souls-night p-2"
                          key={item.chestId}
                        >
                          <img
                            alt={item.chestName}
                            className="mx-auto aspect-square w-full max-w-[64px] object-contain"
                            src={item.chestImageUrl}
                          />
                          <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-souls-panel">
                            {item.chestHours}H chest
                          </p>
                          <p className="mt-1 text-center">
                            <span className="inline-flex min-h-7 items-center rounded border border-souls-gold/60 bg-souls-gold/20 px-2.5 text-base font-black text-souls-gold">
                              ×{item.used}
                            </span>
                          </p>
                          <p className="mt-0.5 text-center text-[11px] text-souls-panel">
                            in bag: {item.available}
                          </p>
                          <p className="mt-0.5 text-center text-[11px] text-souls-spirit">
                            {item.totalValue.toLocaleString("en-US")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function parseNonNegativeNumber(input: string): number | null {
  const normalized = input.trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.floor(parsed);
}

function validateChapterInput(input: string): {
  valid: boolean;
  message: string;
  parsed?: { chapter: number; level: number };
} {
  const normalized = input.trim();
  if (!normalized) {
    return {
      valid: false,
      message: "Enter your current chapter in format chapter-level (example: 40-12).",
    };
  }

  const match = normalized.match(/^(\d+)-(\d+)$/);
  if (!match) {
    return {
      valid: false,
      message: "Invalid format. Use chapter-level, for example 40-12.",
    };
  }

  const chapter = Number(match[1]);
  const level = Number(match[2]);
  if (!Number.isInteger(chapter) || !Number.isInteger(level)) {
    return {
      valid: false,
      message: "Chapter and level must be integers.",
    };
  }

  if (level < MIN_LEVEL || level > MAX_LEVEL) {
    return {
      valid: false,
      message: `Level must be between ${MIN_LEVEL} and ${MAX_LEVEL}.`,
    };
  }

  const isBelowMin =
    chapter < MIN_CHAPTER || (chapter === MIN_CHAPTER && level < MIN_LEVEL);
  const isAboveMax =
    chapter > MAX_CHAPTER || (chapter === MAX_CHAPTER && level > MAX_LEVEL);

  if (isBelowMin || isAboveMax) {
    return {
      valid: false,
      message: `Allowed range is ${MIN_CHAPTER}-${MIN_LEVEL} to ${MAX_CHAPTER}-${MAX_LEVEL}.`,
    };
  }

  return {
    valid: true,
    message: "ok",
    parsed: { chapter, level },
  };
}

function getSoulStoneIndex(chapter: number, level: number) {
  const absoluteLevel = (chapter - MIN_CHAPTER) * 60 + level;

  // User rule examples:
  // 40-11 => 103, 40-12 => 104, 40-31 => 104, 40-32 => 105.
  if (absoluteLevel <= 11) {
    return 103;
  }

  return 104 + Math.floor((absoluteLevel - 12) / 20);
}

function findOptimalChestUsage(
  deficit: number,
  chests: Array<{ available: number; value: number }>,
) {
  const maxChestValue = Math.max(...chests.map((chest) => chest.value));
  const cap = deficit + maxChestValue - 1;

  let dp = new Map<number, number[]>();
  dp.set(0, chests.map(() => 0));

  chests.forEach((chest, chestIndex) => {
    const next = new Map(dp);
    const snapshot = Array.from(dp.entries());

    snapshot.forEach(([sum, counts]) => {
      for (let used = 1; used <= chest.available; used += 1) {
        const nextSum = sum + used * chest.value;
        if (nextSum > cap) {
          break;
        }

        const nextCounts = [...counts];
        nextCounts[chestIndex] = nextCounts[chestIndex] + used;

        const existing = next.get(nextSum);
        if (!existing) {
          next.set(nextSum, nextCounts);
          continue;
        }

        const existingChestTotal = existing.reduce((acc, value) => acc + value, 0);
        const nextChestTotal = nextCounts.reduce((acc, value) => acc + value, 0);
        if (nextChestTotal < existingChestTotal) {
          next.set(nextSum, nextCounts);
        }
      }
    });

    dp = next;
  });

  let bestSum: number | null = null;
  let bestCounts: number[] | null = null;

  Array.from(dp.entries()).forEach(([sum, counts]) => {
    if (sum < deficit) {
      return;
    }

    if (bestSum === null || sum < bestSum) {
      bestSum = sum;
      bestCounts = counts;
      return;
    }

    if (sum === bestSum && bestCounts) {
      const currentChestTotal = bestCounts.reduce((acc, value) => acc + value, 0);
      const nextChestTotal = counts.reduce((acc, value) => acc + value, 0);
      if (nextChestTotal < currentChestTotal) {
        bestCounts = counts;
      }
    }
  });

  return bestCounts;
}


function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-souls-spirit/20 bg-souls-void/45 p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-souls-spirit">{label}</p>
      <p className="mt-1 text-2xl font-black text-souls-parchment">{value}</p>
    </div>
  );
}

function SoulStoneChestCard({
  chest,
  quantity,
  onSetQuantity,
  onResetQuantity,
  perChestSoulStones,
}: {
  chest: SoulStoneChest;
  quantity: number;
  onSetQuantity: (chestId: string, nextQuantity: number) => void;
  onResetQuantity: (chestId: string) => void;
  perChestSoulStones: number | null;
}) {
  const quantityInput = quantity > 0 ? String(quantity) : "";

  return (
    <article className="flex flex-col rounded border border-souls-spirit/18 bg-souls-night p-3">
      <img
        alt={chest.name}
        className="mx-auto aspect-square w-full max-w-[88px] object-contain"
        src={chest.imageUrl}
      />
      <h3 className="mt-2 text-center text-xs font-semibold leading-tight text-souls-parchment">
        {chest.name}
      </h3>
      <div className="mt-1 flex items-center justify-between gap-1.5">
        <span className="inline-flex min-h-6 items-center rounded border border-souls-gold/65 bg-souls-gold/15 px-2 text-[11px] font-bold text-souls-gold">
          Qty: {quantity}
        </span>
        <span className="inline-flex min-h-6 items-center rounded border border-souls-spirit/45 bg-souls-spirit/10 px-2 text-[11px] font-semibold text-souls-spirit">
          {perChestSoulStones === null
            ? "Set chapter"
            : `${Math.floor(perChestSoulStones).toLocaleString("en-US")} / chest`}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_2rem] gap-1.5">
        <input
          className="min-h-8 min-w-0 rounded border border-souls-spirit/20 bg-souls-void/65 px-2 text-[11px] text-souls-parchment outline-none placeholder:text-souls-panel/55 focus:border-souls-spirit"
          inputMode="numeric"
          min="0"
          onChange={(event) => {
            const nextRaw = event.target.value.trim();
            if (nextRaw === "") {
              onSetQuantity(chest.id, 0);
              return;
            }

            const parsedQuantity = Number(nextRaw);
            if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
              return;
            }

            onSetQuantity(chest.id, parsedQuantity);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              (event.currentTarget as HTMLInputElement).blur();
            }
          }}
          placeholder="Qty"
          type="number"
          value={quantityInput}
        />
        <button
          aria-label={`Reset ${chest.name}`}
          className="grid size-8 shrink-0 place-items-center rounded border border-souls-spirit/20 bg-souls-void/65 text-souls-panel transition hover:border-souls-gold hover:text-souls-gold disabled:cursor-not-allowed disabled:opacity-35"
          disabled={quantity <= 0}
          onClick={() => onResetQuantity(chest.id)}
          type="button"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </article>
  );
}
