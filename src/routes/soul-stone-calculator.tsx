import { Link, createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getNextSoulStoneUpgrade,
  getReachableLevelAfterSoulStoneUpgrade,
  getSoulStoneUpgradesFrom,
  MAX_SOUL_LINK_LEVEL,
  MIN_SOUL_LINK_LEVEL,
} from "#/lib/soulLinkUpgradeCosts";
import { findOptimalChestUsage, type ChestPlanMode } from "#/lib/soulStoneChestPlanning";

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
  targetLevel: number;
  reachableLevel: number;
  totalUpgradeCost: number;
  nextUpgradeSummary: {
    totalRemainingValue: number;
    remainingChestValue: number;
    targetLevel: number | null;
    cost: number | null;
    missingSoulStones: number;
  } | null;
};
const SOUL_STONE_CALC_STORAGE_KEY = "souls_soul_stone_calculator_v1";
const SOUL_STONE_CHAPTER_STORAGE_KEY = "souls_soul_stone_chapter_v1";
const SOUL_STONE_CURRENT_STORAGE_KEY = "souls_soul_stone_current_v1";
const SOUL_LINK_LEVEL_STORAGE_KEY = "souls_soul_link_level_v2";
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
  const [soulLinkLevelInput, setSoulLinkLevelInput] = useState("");
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);
  const [planResult, setPlanResult] = useState<ChestPlanResult | null>(null);
  const [planMessage, setPlanMessage] = useState<string | null>(null);
  const [planMode, setPlanMode] = useState<ChestPlanMode>("min-overuse");

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
    const storedSoulLinkLevel = window.localStorage.getItem(SOUL_LINK_LEVEL_STORAGE_KEY);
    if (storedCurrent) {
      setCurrentSoulStonesInput(storedCurrent);
    }
    if (storedSoulLinkLevel) {
      setSoulLinkLevelInput(storedSoulLinkLevel);
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

    window.localStorage.setItem(SOUL_LINK_LEVEL_STORAGE_KEY, soulLinkLevelInput);
  }, [isStorageHydrated, soulLinkLevelInput]);

  const chapterValidation = useMemo(() => validateChapterInput(chapterInput), [chapterInput]);
  const chapterIndex = useMemo(() => {
    if (!chapterValidation.valid || !chapterValidation.parsed) {
      return null;
    }

    return getSoulStoneIndex(chapterValidation.parsed.chapter, chapterValidation.parsed.level);
  }, [chapterValidation]);

  const currentSoulStones = parseNonNegativeNumber(currentSoulStonesInput);
  const soulLinkLevelValidation = useMemo(() => validateSoulLinkLevel(soulLinkLevelInput), [soulLinkLevelInput]);
  const nextSoulStoneUpgrade = useMemo(
    () =>
      soulLinkLevelValidation.valid && soulLinkLevelValidation.level
        ? getNextSoulStoneUpgrade(soulLinkLevelValidation.level)
        : null,
    [soulLinkLevelValidation],
  );
  const totalPossibleFromAllChests = useMemo(() => {
    if (chapterIndex === null) {
      return null;
    }

    return soulStoneChests.reduce((sum, chest) => {
      const quantity = quantities[chest.id] ?? 0;
      const perChest = Math.floor(chapterIndex * SOUL_STONE_HIDDEN_COEFFICIENT * chest.hours);
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
    setSoulLinkLevelInput("");
    setPlanResult(null);
    setPlanMessage(null);
  }

  function calculateChestPlan(isMaximumUpgrade: boolean) {
    setPlanResult(null);

    if (!chapterValidation.valid || chapterIndex === null) {
      setPlanMessage("Enter a valid chapter first.");
      return;
    }

    if (currentSoulStones === null || !soulLinkLevelValidation.valid || !soulLinkLevelValidation.level) {
      setPlanMessage("Enter your current Soul Link level and soul stones.");
      return;
    }

    const upgrades = getSoulStoneUpgradesFrom(soulLinkLevelValidation.level);
    if (upgrades.length === 0) {
      setPlanMessage(`No more Soul Stones are needed through level ${MAX_SOUL_LINK_LEVEL}.`);
      return;
    }
    const chestsWithValues = soulStoneChests.map((chest) => ({
      ...chest,
      available: quantities[chest.id] ?? 0,
      value: Math.floor(chapterIndex * SOUL_STONE_HIDDEN_COEFFICIENT * chest.hours),
    }));
    const totalAvailableSoulStones = chestsWithValues.reduce((sum, chest) => sum + chest.available * chest.value, 0);
    const totalBudget = currentSoulStones + totalAvailableSoulStones;
    const selectedUpgrades = isMaximumUpgrade ? getMaximumAffordableUpgrades(upgrades, totalBudget) : [upgrades[0]];

    if (selectedUpgrades.length === 0) {
      setPlanMessage(
        `Not enough soul stones for the next upgrade to level ${upgrades[0].targetLevel}. Need ${upgrades[0].cost.toLocaleString("en-US")}.`,
      );
      return;
    }

    const totalUpgradeCost = selectedUpgrades.reduce((sum, upgrade) => sum + upgrade.cost, 0);
    const deficit = Math.max(totalUpgradeCost - currentSoulStones, 0);

    if (totalAvailableSoulStones < deficit) {
      setPlanMessage(
        `Not enough chests. Missing ${(deficit - totalAvailableSoulStones).toLocaleString("en-US")} soul stones.`,
      );
      return;
    }

    if (deficit === 0) {
      setPlanMessage("You already have enough soul stones. No chests needed.");
      const items = chestsWithValues.map((chest) => ({
        chestId: chest.id,
        chestName: chest.name,
        chestImageUrl: chest.imageUrl,
        chestHours: chest.hours,
        used: 0,
        available: chest.available,
        perChestValue: chest.value,
        totalValue: 0,
      }));
      const reachableLevel = getReachableLevelAfterSoulStoneUpgrade(selectedUpgrades.at(-1)!.targetLevel);
      const finalSoulStones = currentSoulStones - totalUpgradeCost;
      setPlanResult({
        items,
        addedSoulStones: 0,
        finalSoulStones,
        overflowAfterRequirement: finalSoulStones,
        targetLevel: selectedUpgrades.at(-1)!.targetLevel,
        reachableLevel,
        totalUpgradeCost,
        nextUpgradeSummary: getNextUpgradeSummary(isMaximumUpgrade, reachableLevel, finalSoulStones, items),
      });
      return;
    }

    const usedCounts = findOptimalChestUsage(deficit, chestsWithValues, planMode);
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
    const finalSoulStones = currentSoulStones + addedSoulStones - totalUpgradeCost;
    const overflowAfterRequirement = finalSoulStones;
    const reachableLevel = getReachableLevelAfterSoulStoneUpgrade(selectedUpgrades.at(-1)!.targetLevel);

    setPlanMessage(null);
    setPlanResult({
      items,
      addedSoulStones,
      finalSoulStones,
      overflowAfterRequirement,
      targetLevel: selectedUpgrades.at(-1)!.targetLevel,
      reachableLevel,
      totalUpgradeCost,
      nextUpgradeSummary: getNextUpgradeSummary(isMaximumUpgrade, reachableLevel, finalSoulStones, items),
    });
  }

  function applyPlanResult() {
    if (!planResult) {
      return;
    }

    setQuantities((current) => {
      const next = { ...current };
      planResult.items.forEach((item) => {
        const currentQty = next[item.chestId] ?? 0;
        const updatedQty = Math.max(currentQty - item.used, 0);
        if (updatedQty <= 0) {
          delete next[item.chestId];
        } else {
          next[item.chestId] = updatedQty;
        }
      });
      return next;
    });

    setCurrentSoulStonesInput(String(planResult.overflowAfterRequirement));
    setSoulLinkLevelInput(String(planResult.reachableLevel));
    setPlanResult(null);
    setPlanMessage(`Plan applied. Level is now ${planResult.reachableLevel}; remaining soul stones were saved.`);
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
              <Link
                className="rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                to="/heroes"
              >
                Heroes
              </Link>
              <Link
                className="rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                to="/counterpick"
              >
                Counterpick
              </Link>
              <Link
                className="rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                to="/support"
              >
                Support
              </Link>
            </div>
          </nav>

          <section className="artifact-preview p-4 md:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-souls-spirit/20 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-souls-spirit">Calculator</p>
                <h1 className="mt-1 text-3xl font-black text-souls-parchment md:text-4xl">Soul Stone Calculator</h1>
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
                  <p className="text-xs uppercase tracking-[0.12em] text-souls-spirit">Current chapter</p>
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
              <p className={`mt-2 text-sm ${chapterValidation.valid ? "text-souls-leaf" : "text-souls-ember"}`}>
                {chapterValidation.valid ? "Valid chapter." : chapterValidation.message}
              </p>
            </div>

            <div className="mt-4 rounded border border-souls-spirit/20 bg-souls-void/45 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-[0.12em] text-souls-spirit">Current soul stones</span>
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
                  <span className="text-xs uppercase tracking-[0.12em] text-souls-spirit">Current Soul Link level</span>
                  <input
                    className="min-h-9 rounded border border-souls-spirit/25 bg-souls-void/65 px-3 text-sm text-souls-parchment outline-none placeholder:text-souls-panel/55 focus:border-souls-spirit"
                    inputMode="numeric"
                    max={MAX_SOUL_LINK_LEVEL}
                    min={MIN_SOUL_LINK_LEVEL}
                    onChange={(event) => setSoulLinkLevelInput(event.target.value)}
                    placeholder="220"
                    type="number"
                    value={soulLinkLevelInput}
                  />
                  <span
                    className={`text-sm ${soulLinkLevelValidation.valid ? "text-souls-panel" : "text-souls-ember"}`}
                  >
                    {!soulLinkLevelValidation.valid ? (
                      soulLinkLevelValidation.message
                    ) : nextSoulStoneUpgrade ? (
                      <>
                        Next payment at level {nextSoulStoneUpgrade.targetLevel}:{" "}
                        <strong className="text-souls-gold">
                          {nextSoulStoneUpgrade.cost.toLocaleString("en-US")} stones
                        </strong>
                      </>
                    ) : (
                      `No further Soul Stones are needed through level ${MAX_SOUL_LINK_LEVEL}.`
                    )}
                  </span>
                </label>
              </div>
              <div className="mt-2">
                <p className="text-sm text-souls-spirit">
                  {totalPossibleFromAllChests === null
                    ? "Set a valid chapter to see total possible from all chests."
                    : `Total possible from all chests: ${totalPossibleFromAllChests.toLocaleString("en-US")}`}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {soulStoneChests.map((chest) => (
                <SoulStoneChestCard
                  chest={chest}
                  key={chest.id}
                  onSetQuantity={setQuantity}
                  onResetQuantity={resetQuantity}
                  perChestSoulStones={
                    chapterIndex === null ? null : chapterIndex * SOUL_STONE_HIDDEN_COEFFICIENT * chest.hours
                  }
                  quantity={quantities[chest.id] ?? 0}
                />
              ))}
            </div>

            <div className="mt-4 rounded border border-souls-spirit/20 bg-souls-void/45 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="rounded border border-souls-gold bg-souls-gold px-3 py-1.5 text-sm font-semibold text-souls-void transition hover:brightness-95"
                  onClick={() => calculateChestPlan(false)}
                  type="button"
                >
                  Plan next upgrade
                </button>
                <button
                  className="rounded border border-souls-spirit/55 bg-souls-spirit/15 px-3 py-1.5 text-sm font-semibold text-souls-parchment transition hover:border-souls-spirit hover:bg-souls-spirit/25"
                  onClick={() => calculateChestPlan(true)}
                  type="button"
                >
                  Plan maximum upgrades
                </button>
                <span className="hidden h-7 w-px bg-souls-spirit/20 sm:block" />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-souls-spirit/20 bg-souls-void/55 px-2 py-1">
                  <span
                    className={`text-xs font-semibold ${
                      planMode === "min-overuse" ? "text-souls-parchment" : "text-souls-panel/65"
                    }`}
                  >
                    Min overuse
                  </span>
                  <button
                    aria-label="Toggle plan mode"
                    className={`relative h-5 w-10 rounded-full transition ${
                      planMode === "balanced" ? "bg-souls-gold/85" : "bg-souls-dusk/70"
                    }`}
                    onClick={() => setPlanMode((current) => (current === "balanced" ? "min-overuse" : "balanced"))}
                    type="button"
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-souls-panel transition-transform duration-200 ease-out ${
                        planMode === "balanced" ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="sr-only">
                    {planMode === "balanced" ? "Balanced mode enabled" : "Min overuse mode enabled"}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      planMode === "balanced" ? "text-souls-parchment" : "text-souls-panel/65"
                    }`}
                  >
                    Balanced
                  </span>
                </label>
                {planMessage ? <span className="text-sm text-souls-ember">{planMessage}</span> : null}
              </div>

              {planResult ? (
                <div className="mt-3 space-y-2">
                  <div className="grid gap-3 lg:grid-cols-[minmax(240px,0.45fr)_minmax(0,1.55fr)]">
                    <section className="rounded border border-souls-gold/30 bg-souls-gold/5 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-souls-gold">Level result</p>
                      <div className="mt-2">
                        <StatCard label="Reachable level" value={planResult.reachableLevel.toLocaleString("en-US")} />
                      </div>
                    </section>
                    <section className="rounded border border-souls-spirit/20 bg-souls-void/30 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-souls-spirit">
                        Soul Stone summary
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        <StatCard
                          label="Total Soul Stones needed"
                          value={planResult.totalUpgradeCost.toLocaleString("en-US")}
                        />
                        <StatCard
                          label="Soul Stones from chests"
                          value={planResult.addedSoulStones.toLocaleString("en-US")}
                        />
                        <StatCard
                          label="Loose Soul Stones remaining"
                          value={planResult.finalSoulStones.toLocaleString("en-US")}
                        />
                      </div>
                    </section>
                  </div>
                  {planResult.nextUpgradeSummary ? (
                    <section className="rounded border border-souls-leaf/30 bg-souls-leaf/5 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-souls-leaf">
                        Next Soul Stone payment
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        <StatCard
                          label="Total value remaining"
                          value={planResult.nextUpgradeSummary.totalRemainingValue.toLocaleString("en-US")}
                        />
                        {planResult.nextUpgradeSummary.targetLevel !== null &&
                        planResult.nextUpgradeSummary.cost !== null ? (
                          <>
                            <StatCard
                              label={`Needed for level ${planResult.nextUpgradeSummary.targetLevel}`}
                              value={planResult.nextUpgradeSummary.cost.toLocaleString("en-US")}
                            />
                            <StatCard
                              label="Still missing"
                              value={planResult.nextUpgradeSummary.missingSoulStones.toLocaleString("en-US")}
                            />
                          </>
                        ) : (
                          <div className="rounded border border-souls-leaf/25 bg-souls-void/45 p-3 sm:col-span-2">
                            <p className="text-xs uppercase tracking-[0.12em] text-souls-leaf">Progress</p>
                            <p className="mt-1 text-2xl font-black text-souls-parchment">Maximum level reached</p>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-souls-panel">
                        Total value remaining includes loose Soul Stones and{" "}
                        {planResult.nextUpgradeSummary.remainingChestValue.toLocaleString("en-US")} Soul Stones still
                        stored in unopened chests.
                      </p>
                    </section>
                  ) : null}
                  <div className="rounded border border-souls-spirit/18 bg-souls-void/45 p-2">
                    <p className="text-xs uppercase tracking-[0.12em] text-souls-spirit">Chest usage plan</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
                      {planResult.items.map((item) => (
                        <div className="rounded border border-souls-spirit/18 bg-souls-night p-2" key={item.chestId}>
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
                          <p className="mt-0.5 text-center text-[11px] text-souls-panel">in bag: {item.available}</p>
                          <p className="mt-0.5 text-center text-[11px] text-souls-spirit">
                            {item.totalValue.toLocaleString("en-US")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded border border-souls-spirit/18 bg-souls-void/45 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        className="rounded border border-souls-leaf bg-souls-leaf px-3 py-1.5 text-sm font-semibold text-souls-void transition hover:brightness-95"
                        onClick={applyPlanResult}
                        type="button"
                      >
                        Apply this plan
                      </button>
                      <p className="text-sm text-souls-panel">
                        Subtracts used chests, saves your remaining Soul Stones, and updates your Soul Link level.
                      </p>
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

function getNextUpgradeSummary(
  isMaximumUpgrade: boolean,
  reachableLevel: number,
  looseSoulStones: number,
  items: ChestPlanItem[],
): ChestPlanResult["nextUpgradeSummary"] {
  if (!isMaximumUpgrade) {
    return null;
  }

  const remainingChestValue = items.reduce((sum, item) => sum + (item.available - item.used) * item.perChestValue, 0);
  const totalRemainingValue = looseSoulStones + remainingChestValue;
  const nextUpgrade = getNextSoulStoneUpgrade(reachableLevel);

  return {
    totalRemainingValue,
    remainingChestValue,
    targetLevel: nextUpgrade?.targetLevel ?? null,
    cost: nextUpgrade?.cost ?? null,
    missingSoulStones: nextUpgrade ? Math.max(nextUpgrade.cost - totalRemainingValue, 0) : 0,
  };
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

function validateSoulLinkLevel(input: string): { valid: boolean; message: string; level?: number } {
  const level = parseNonNegativeNumber(input);
  if (level === null) {
    return { valid: false, message: `Enter a Soul Link level from ${MIN_SOUL_LINK_LEVEL} to ${MAX_SOUL_LINK_LEVEL}.` };
  }
  if (level < MIN_SOUL_LINK_LEVEL || level > MAX_SOUL_LINK_LEVEL) {
    return {
      valid: false,
      message: `Soul Link level must be between ${MIN_SOUL_LINK_LEVEL} and ${MAX_SOUL_LINK_LEVEL}.`,
    };
  }
  return { valid: true, message: "ok", level };
}

function getMaximumAffordableUpgrades(upgrades: Array<{ targetLevel: number; cost: number }>, totalBudget: number) {
  const affordable: Array<{ targetLevel: number; cost: number }> = [];
  let spent = 0;

  for (const upgrade of upgrades) {
    if (spent + upgrade.cost > totalBudget) {
      break;
    }
    affordable.push(upgrade);
    spent += upgrade.cost;
  }

  return affordable;
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

  const isBelowMin = chapter < MIN_CHAPTER || (chapter === MIN_CHAPTER && level < MIN_LEVEL);
  const isAboveMax = chapter > MAX_CHAPTER || (chapter === MAX_CHAPTER && level > MAX_LEVEL);

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
      <img alt={chest.name} className="mx-auto aspect-square w-full max-w-[88px] object-contain" src={chest.imageUrl} />
      <h3 className="mt-2 text-center text-xs font-semibold leading-tight text-souls-parchment">{chest.name}</h3>
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
