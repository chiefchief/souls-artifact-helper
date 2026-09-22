import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { AppHeader } from "../components/AppHeader";

export const Route = createFileRoute("/events")({ component: EventsPage });

type Cell = [number, number];
type Shape = { id: string; name: string; cells: Cell[]; color: string; hint: string; imageUrl: string };
type Placement = {
  shape: Shape;
  anchor: Cell;
  cells: Cell[];
  gain: number;
  priority: number;
  futureOptions: number;
  projectedMoves: number;
  score: number;
};

const rows = [0, 1, 2, 3, 4];
const emptyBoard = () => Array.from({ length: 5 }, () => Array(5).fill(false));
const keyFor = ([row, col]: Cell) => `${row}:${col}`;
const luckyPuzzleAsset = (fileName: string) => `${import.meta.env.BASE_URL}events/lucky-puzzle/${fileName}`;
const columnRewardImages = rows.map((index) => luckyPuzzleAsset(`items/column-${index + 1}.png`));
const rowRewardImages = rows.map((index) => luckyPuzzleAsset(`items/row-${index + 1}.png`));
const columnRewardCounts = ["1", "5", "10", "8", "1"];
const rowRewardCounts = ["30", "6h\n1", "6h\n1", "6h\n1", "1"];

const shapes: Shape[] = [
  {
    id: "cross",
    name: "Cross",
    cells: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ],
    color: "#8ce6d8",
    hint: "Up, down, left and right",
    imageUrl: luckyPuzzleAsset("shape-cross.png"),
  },
  {
    id: "t",
    name: "T-shape",
    cells: [
      [0, 0],
      [0, -1],
      [0, 1],
      [1, 0],
    ],
    color: "#b89cff",
    hint: "Left, right and down",
    imageUrl: luckyPuzzleAsset("shape-t.png"),
  },
  {
    id: "square",
    name: "2 × 2",
    cells: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    color: "#f5c96c",
    hint: "Right, down and bottom-right",
    imageUrl: luckyPuzzleAsset("shape-square.png"),
  },
  {
    id: "corner",
    name: "L-shape",
    cells: [
      [0, 0],
      [0, 1],
      [1, 0],
    ],
    color: "#fb9873",
    hint: "Right and down",
    imageUrl: luckyPuzzleAsset("shape-l.png"),
  },
  {
    id: "line",
    name: "3-tile line",
    cells: [
      [0, -1],
      [0, 0],
      [0, 1],
    ],
    color: "#73bbff",
    hint: "Left and right",
    imageUrl: luckyPuzzleAsset("shape-line.png"),
  },
];

function applyPlacementToBoard(board: boolean[][], placement: Placement) {
  const next = board.map((line) => [...line]);
  for (const [row, col] of placement.cells) next[row][col] = true;

  // A completed line flips every tile in that row or column. Resolve cascades too:
  // a newly flipped line can complete a line in the other direction.
  let changed = true;
  while (changed) {
    changed = false;
    for (const row of rows)
      if (next[row].every(Boolean))
        for (const col of rows)
          if (!next[row][col]) {
            next[row][col] = true;
            changed = true;
          }
    for (const col of rows)
      if (rows.every((row) => next[row][col]))
        for (const row of rows)
          if (!next[row][col]) {
            next[row][col] = true;
            changed = true;
          }
  }
  return next;
}

const countCovered = (board: boolean[][]) => board.flat().filter(Boolean).length;
const priorityWeight = (value: number, order: number[]) => (order.indexOf(value) < 0 ? 0 : 5 - order.indexOf(value));

function basePlacements(board: boolean[][], columnOrder: number[], rowOrder: number[]) {
  const covered = countCovered(board);
  const candidates: Placement[] = [];

  for (const shape of shapes) {
    for (const row of rows) {
      for (const col of rows) {
        const inBoundsCells = shape.cells
          .map(([dr, dc]) => [row + dr, col + dc] as Cell)
          .filter(([cellRow, cellCol]) => cellRow >= 0 && cellRow < 5 && cellCol >= 0 && cellCol < 5);
        const cells = inBoundsCells.filter(([cellRow, cellCol]) => !board[cellRow][cellCol]);
        if (cells.length === 0) continue;

        const priority = cells.reduce(
          (sum, [cellRow, cellCol]) => sum + priorityWeight(cellRow, rowOrder) + priorityWeight(cellCol, columnOrder),
          0,
        );
        const nextCovered = countCovered(applyPlacementToBoard(board, {
          shape,
          anchor: [row, col],
          cells,
          gain: 0,
          priority: 0,
          futureOptions: 0,
          projectedMoves: 0,
          score: 0,
        }));
        candidates.push({
          shape,
          anchor: [row, col],
          cells,
          gain: nextCovered - covered,
          priority,
          futureOptions: 0,
          projectedMoves: 0,
          score: 0,
        });
      }
    }
  }
  return candidates;
}

function rankPlacements(board: boolean[][], columnOrder: number[], rowOrder: number[]) {
  const target = 20;
  const candidates = basePlacements(board, columnOrder, rowOrder);

  return candidates.map((candidate) => {
    const nextBoard = applyPlacementToBoard(board, candidate);
    const nextCovered = countCovered(nextBoard);
    const followUps = basePlacements(nextBoard, columnOrder, rowOrder);
    const bestNextGain = Math.max(0, ...followUps.map((placement) => placement.gain));
    const valuableThreshold = Math.max(2, bestNextGain - 1);
    const futureOptions = followUps.filter((placement) => placement.gain >= valuableThreshold).length;

    // The first criterion is the fewest blocks needed to reach 80%.  We then
    // favour a board that still has many strong follow-up placements, so a
    // locally good move cannot unnecessarily close off the next shapes.
    const projectedMoves = nextCovered >= target
      ? 0
      : Math.ceil((target - nextCovered) / Math.max(1, bestNextGain));
    const twoMoveGain = candidate.gain + bestNextGain;
    const score =
      (10 - projectedMoves) * 1_000_000 +
      twoMoveGain * 10_000 +
      futureOptions * 100 +
      candidate.priority * 3;

    return { ...candidate, futureOptions, projectedMoves, score };
  });
}

function EventsPage() {
  return (
    <main className="min-h-screen bg-souls-void text-souls-parchment">
      <section className="hero-shell min-h-screen py-4">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <AppHeader activePath="/events" />
          <section className="artifact-preview overflow-hidden bg-[radial-gradient(circle_at_50%_5%,rgba(246,200,95,.18),transparent_24rem),linear-gradient(180deg,rgba(74,54,39,.78),rgba(29,36,53,.92))] p-4 md:p-8">
            <header className="mx-auto max-w-4xl border-b border-souls-gold/40 pb-6 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-full border border-souls-gold/45 bg-souls-gold/10 text-souls-gold">
                <CalendarDays className="size-6" />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[.24em] text-souls-gold">Events</p>
              <h1 className="mt-2 font-serif text-4xl font-bold italic text-souls-gold drop-shadow-[0_2px_8px_rgba(0,0,0,.75)] md:text-5xl">
                Time Limited Event
              </h1>
              <p className="mt-3 text-sm italic text-souls-panel/85 md:text-base">
                Participate in limited-time events to get abundant rewards.
              </p>
            </header>
            <div className="mx-auto mt-6 max-w-4xl space-y-5">
              <Link
                className="group relative block overflow-hidden rounded border-2 border-souls-gold/55 bg-[#38291f] shadow-[0_12px_26px_rgba(0,0,0,.35)] transition hover:-translate-y-1 hover:border-souls-gold hover:shadow-[0_18px_34px_rgba(0,0,0,.48)]"
                to="/events/lucky-puzzle"
              >
                <img
                  alt="Lucky Puzzle event"
                  className="absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  src={luckyPuzzleAsset("list-cover.png")}
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(38,29,23,.96)_0%,rgba(38,29,23,.72)_44%,rgba(38,29,23,.12)_100%)]" />
                <div className="relative min-h-52 p-5 md:min-h-64 md:p-8">
                  <p className="inline-flex items-center gap-2 rounded-full border border-souls-gold/45 bg-souls-void/55 px-3 py-1 text-xs font-bold uppercase tracking-[.16em] text-souls-gold">
                    <Sparkles className="size-3.5" /> Active event
                  </p>
                  <h2 className="mt-5 font-serif text-4xl font-bold italic text-souls-parchment drop-shadow md:text-5xl">
                    Lucky Puzzle
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-souls-panel/90 md:text-base">
                    Open hidden rewards by placing blocks strategically and completing the board.
                  </p>
                  <p className="mt-5 flex items-center gap-2 text-sm font-bold italic text-souls-gold">
                    <CalendarDays className="size-4" /> Remaining time of event: 6 Day
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-souls-parchment">
                    Open event <ChevronRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export function LuckyPuzzlePage() {
  const [view, setView] = useState<"mission" | "solution">("solution");
  const [step, setStep] = useState<"columns" | "rows" | "play" | "complete">("columns");
  const [columnOrder, setColumnOrder] = useState<number[]>([]);
  const [rowOrder, setRowOrder] = useState<number[]>([]);
  const [board, setBoard] = useState<boolean[][]>(emptyBoard);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [shownPlacement, setShownPlacement] = useState<Placement | null>(null);

  const covered = countCovered(board);
  const percent = Math.round((covered / 25) * 100);

  const placements = useMemo(() => rankPlacements(board, columnOrder, rowOrder), [board, columnOrder, rowOrder]);

  const recommendations = useMemo(
    () =>
      shapes
        .map(
          (shape) =>
            placements.filter((placement) => placement.shape.id === shape.id).sort((a, b) => b.score - a.score)[0],
        )
        .filter((placement): placement is Placement => Boolean(placement))
        .sort((a, b) => b.score - a.score),
    [placements],
  );

  const selectedPlacement = recommendations.find((placement) => placement.shape.id === selectedShapeId) ?? null;
  const highlighted = new Set((shownPlacement ?? selectedPlacement)?.cells.map(keyFor) ?? []);

  function choosePriority(value: number, kind: "columns" | "rows") {
    const current = kind === "columns" ? columnOrder : rowOrder;
    if (current.includes(value)) {
      const next = current.filter((selected) => selected !== value);
      if (kind === "columns") setColumnOrder(next);
      else setRowOrder(next);
      return;
    }
    const next = [...current, value];
    if (kind === "columns") {
      setColumnOrder(next);
      if (next.length === 5) setStep("rows");
    } else {
      setRowOrder(next);
      if (next.length === 5) setStep("play");
    }
  }

  function placeRecommendation() {
    const placement = shownPlacement ?? selectedPlacement;
    if (!placement) return;
    const nextBoard = applyPlacementToBoard(board, placement);
    const nextCovered = nextBoard.flat().filter(Boolean).length;
    setBoard(nextBoard);
    setSelectedShapeId(null);
    setShownPlacement(null);
    if (covered < 20 && nextCovered >= 20) setStep("complete");
  }

  function reset() {
    setBoard(emptyBoard());
    setSelectedShapeId(null);
    setShownPlacement(null);
    setStep("columns");
    setColumnOrder([]);
    setRowOrder([]);
  }

  return (
    <main className="min-h-screen bg-souls-void text-souls-parchment">
      <section className="hero-shell min-h-screen py-4">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <AppHeader activePath="/events" />
          <section className="artifact-preview overflow-hidden p-0">
            <div className="flex flex-wrap gap-2 border-b border-souls-spirit/15 bg-souls-night/55 px-4 py-3 md:px-6">
              {[
                ["solution", "Solution"],
                ["mission", "Mission"],
              ].map(([id, label]) => (
                <button
                  className="rounded border px-4 py-2 text-sm font-semibold transition data-[active=true]:border-souls-gold data-[active=true]:bg-souls-gold data-[active=true]:text-souls-void data-[active=false]:border-souls-spirit/20 data-[active=false]:text-souls-panel"
                  data-active={view === id}
                  key={id}
                  onClick={() => setView(id as typeof view)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            {view === "mission" ? (
              <Mission />
            ) : (
              <SolutionWorkspace
                board={board}
                columnOrder={columnOrder}
                covered={covered}
                highlighted={highlighted}
                onChoosePriority={choosePriority}
                onContinue={() => setStep("play")}
                onNext={placeRecommendation}
                onReset={reset}
                onSelectShape={(placement) => {
                  setSelectedShapeId(placement.shape.id);
                  setShownPlacement(placement);
                }}
                percent={percent}
                recommendations={recommendations}
                rowOrder={rowOrder}
                selectedPlacement={selectedPlacement}
                step={step}
              />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function Mission() {
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(() => new Set());
  const ticketReward = luckyPuzzleAsset("ticket.png");
  const roundRewards = [
    luckyPuzzleAsset("round-2.png"),
    luckyPuzzleAsset("round-3.png"),
    luckyPuzzleAsset("round-6.png"),
    luckyPuzzleAsset("round-10.png"),
  ];
  const missions = [
    { title: "Login 1 day in total", reward: "50", isTicket: true, image: ticketReward },
    ...[
      ["Pet Summon 10 Times Achieved", 10, "400"],
      ["Pet Summon 30 Times Achieved", 30, "600"],
      ["Pet Summon 50 Times Achieved", 50, "800"],
      ["Pet Summon 80 Times Achieved", 80, "1,000"],
      ["Pet Summon 100 Times Achieved", 100, "1,200"],
    ].map(([title, target, reward]) => ({ title, reward, isTicket: true, image: ticketReward })),
    ...[
      ["Summon Heroes 10 times", 10, "300"],
      ["Summon Heroes 30 times", 30, "450"],
      ["Summon Heroes 50 times", 50, "650"],
      ["Summon Heroes 80 times", 80, "850"],
      ["Summon Heroes 100 times", 100, "1,200"],
      ["Summon Heroes 120 times", 120, "1,600"],
    ].map(([title, target, reward]) => ({ title, reward, isTicket: true, image: ticketReward })),
    ...[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((target) => ({
      title: `Challenge the arena ${target} times`,
      reward: target <= 50 ? "50" : target <= 80 ? "100" : target === 90 ? "150" : "200",
      isTicket: true,
      image: ticketReward,
    })),
    ...[2, 3, 4, 5, 6, 7].map((target) => ({
      title: `Login ${target} days in total`,
      reward: target === 2 ? "50" : "100",
      isTicket: true,
      image: ticketReward,
    })),
    ...[
      ["Reach Round 2 of Lucky Puzzle", 2, "24h × 4"],
      ["Reach Round 3 of Lucky Puzzle", 3, "3"],
      ["Reach Round 6 of Lucky Puzzle", 6, "150"],
      ["Reach Round 10 of Lucky Puzzle", 10, "1"],
    ].map(([title, target, reward], index) => ({
      title,
      reward,
      isTicket: false,
      image: roundRewards[index],
    })),
  ];
  const receivedTickets = missions
    .filter((mission) => mission.isTicket && completedMissions.has(mission.title))
    .reduce((total, mission) => total + Number(mission.reward.replace(",", "")), 0);
  const receivedRoundRewards = missions.filter(
    (mission) => !mission.isTicket && completedMissions.has(mission.title),
  ).length;
  const allSelected = completedMissions.size === missions.length;

  function toggleMission(title: string) {
    setCompletedMissions((current) => {
      const next = new Set(current);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  function toggleAllMissions() {
    setCompletedMissions(allSelected ? new Set() : new Set(missions.map((mission) => mission.title)));
  }

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(104,197,142,.22),transparent_28rem),linear-gradient(180deg,rgba(15,71,61,.35),rgba(17,21,34,.15))] px-4 py-6 md:px-8">
      <header className="mx-auto max-w-4xl border-b border-souls-gold/25 pb-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[.24em] text-souls-gold">Lucky Puzzle</p>
        <h2 className="mt-2 text-3xl font-black md:text-4xl">Event Missions</h2>
        <p className="mt-2 text-sm text-souls-panel/75">
          Mark each reward you have received to keep your own event progress.
        </p>
      </header>
      <div className="mx-auto mt-5 grid max-w-4xl grid-cols-2 gap-3 rounded-xl border border-souls-gold/30 bg-souls-void/35 p-3 text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-souls-panel/60">Tickets received</p>
          <p className="mt-1 text-xl font-black text-souls-gold">{receivedTickets.toLocaleString()}</p>
        </div>
        <div className="border-l border-souls-gold/20">
          <p className="text-xs font-bold uppercase tracking-wide text-souls-panel/60">Round rewards</p>
          <p className="mt-1 text-xl font-black text-souls-gold">{receivedRoundRewards}/4</p>
        </div>
      </div>
      <div className="mx-auto mt-3 flex max-w-4xl justify-end">
        <button
          className="rounded border border-souls-gold/45 bg-souls-gold/10 px-3 py-1.5 text-xs font-bold text-souls-gold transition hover:bg-souls-gold hover:text-souls-void"
          onClick={toggleAllMissions}
          type="button"
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>
      <div className="mx-auto mt-5 max-w-4xl space-y-3">
        {missions.map(({ title, reward, image }) => {
          const isComplete = completedMissions.has(title);
          return (
          <article
            className="grid grid-cols-[3.5rem_minmax(0,1fr)_2rem] items-center gap-2 rounded-lg border border-[#7c6248] bg-[linear-gradient(110deg,rgba(67,53,40,.97),rgba(47,39,31,.97))] p-2.5 shadow-[0_5px_9px_rgba(0,0,0,.2)] transition data-[complete=true]:border-souls-leaf/75 data-[complete=true]:bg-souls-leaf/10 md:grid-cols-[4.25rem_minmax(0,1fr)_2.5rem] md:gap-3 md:p-3"
            data-complete={isComplete}
            key={title}
          >
            <div className="relative grid aspect-square place-items-center rounded-xl border-2 border-[#6f5a43] bg-[radial-gradient(circle_at_35%_25%,#685b4b,#302921_70%)] shadow-inner">
              <img alt="" className="size-[78%] object-contain" src={image} />
              <span className="absolute -bottom-1 rounded bg-souls-void/85 px-1 text-[10px] font-black text-souls-gold md:px-1.5 md:text-xs">
                {reward}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-snug text-souls-parchment md:text-base">{title}</h3>
            </div>
            <label className="grid cursor-pointer place-items-center">
              <span className="sr-only">Mark {title} as received</span>
              <input
                checked={isComplete}
                className="peer sr-only"
                onChange={() => toggleMission(title)}
                type="checkbox"
              />
              <span className="grid size-6 place-items-center rounded border-2 border-souls-gold/55 bg-souls-void/60 text-transparent transition peer-checked:border-souls-leaf peer-checked:bg-souls-leaf peer-checked:text-souls-void md:size-7">
                <Check className="size-3.5 md:size-4" strokeWidth={3} />
              </span>
            </label>
          </article>
          );
        })}
      </div>
    </section>
  );
}
function SolutionWorkspace({
  board,
  columnOrder,
  covered,
  highlighted,
  onChoosePriority,
  onContinue,
  onNext,
  onReset,
  onSelectShape,
  percent,
  recommendations,
  rowOrder,
  selectedPlacement,
  step,
}: {
  board: boolean[][];
  columnOrder: number[];
  covered: number;
  highlighted: Set<string>;
  onChoosePriority: (value: number, kind: "columns" | "rows") => void;
  onContinue: () => void;
  onNext: () => void;
  onReset: () => void;
  onSelectShape: (placement: Placement) => void;
  percent: number;
  recommendations: Placement[];
  rowOrder: number[];
  selectedPlacement: Placement | null;
  step: "columns" | "rows" | "play" | "complete";
}) {
  const isColumnsStep = step === "columns";
  const isRowsStep = step === "rows";
  const prompt = isColumnsStep
    ? "Choose priority columns"
    : isRowsStep
      ? "Choose priority rows"
      : step === "complete"
        ? "80% goal complete"
        : "Choose a recommended shape";
  const detail = isColumnsStep
    ? "Click the columns above the board, from highest priority to lowest."
    : isRowsStep
      ? "Now click the rows on the left of the board, from highest priority to lowest."
      : step === "complete"
        ? "You can continue to fill the whole board, or start a new plan."
        : "The list is ranked for the current board. Select a shape to see exactly where it should go.";
  const bestScore = recommendations[0]?.score ?? 0;
  return (
    <div className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-6">
      <section className="min-w-0 rounded border border-souls-gold/30 bg-souls-void/35 p-3 md:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-souls-spirit">Lucky Puzzle board</p>
            <p className="mt-1 text-sm text-souls-panel/70">{covered}/25 tiles filled</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-souls-gold">{percent}%</p>
            <p className="text-xs text-souls-panel/60">goal: 80%</p>
          </div>
        </div>
        <div className="mx-auto grid w-full max-w-[46rem] grid-cols-[minmax(0,1fr)_3.5rem] gap-2 sm:grid-cols-[minmax(0,1fr)_5rem] sm:gap-3 md:grid-cols-[minmax(0,1fr)_6rem]">
          <div className="grid grid-cols-5 gap-1.5">
            {rows.map((value) => (
              <button
                aria-label={`Column ${value + 1}`}
                className="relative grid h-12 w-full place-items-center rounded border border-transparent transition data-[chosen=true]:border-souls-gold data-[chosen=true]:bg-souls-gold/20 disabled:cursor-default disabled:opacity-60 sm:h-20 md:h-24"
                data-chosen={columnOrder.includes(value)}
                disabled={!isColumnsStep}
                key={value}
                onClick={() => onChoosePriority(value, "columns")}
                type="button"
              >
                <span className="relative grid size-9 place-items-center rounded-md border border-[#8c6746] bg-[#463126] shadow-inner sm:size-16 md:size-20">
                  <img alt="" className="size-7 object-contain sm:size-12 md:size-16" src={columnRewardImages[value]} />
                  <span className="absolute -bottom-1 -right-1 rounded bg-souls-void/90 px-1 text-[10px] font-black leading-4 text-souls-gold sm:px-1.5 sm:text-xs sm:leading-5">
                    {columnRewardCounts[value]}
                  </span>
                </span>
                {columnOrder.includes(value) && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-souls-gold text-xs font-black text-souls-void sm:size-6 sm:text-sm">
                    {columnOrder.indexOf(value) + 1}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div />
          <div className="grid grid-cols-5 gap-1.5 rounded border border-souls-gold/30 bg-[#38291f] p-2">
            {board.map((line, row) =>
              line.map((filled, col) => {
                const isHighlighted = highlighted.has(`${row}:${col}`);
                const overlay = filled
                  ? "rgba(104,197,142,.55)"
                  : isHighlighted
                    ? `${selectedPlacement?.shape.color}88`
                    : "transparent";
                return (
                  <div
                    className="aspect-square rounded-md border border-black/25 bg-cover bg-center transition"
                    key={`${row}-${col}`}
                    style={{
                      backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${luckyPuzzleAsset("cover.png")})`,
                      boxShadow: isHighlighted ? "0 0 18px currentColor" : undefined,
                    }}
                  />
                );
              }),
            )}
          </div>
          <div className="grid min-w-0 grid-rows-5 gap-1.5">
            {rows.map((value) => (
              <button
                aria-label={`Row ${value + 1}`}
                className="relative grid h-full min-w-0 place-items-center rounded border border-transparent transition data-[chosen=true]:border-souls-gold data-[chosen=true]:bg-souls-gold/20 disabled:cursor-default disabled:opacity-60"
                data-chosen={rowOrder.includes(value)}
                disabled={!isRowsStep}
                key={value}
                onClick={() => onChoosePriority(value, "rows")}
                type="button"
              >
                <span className="relative grid size-9 place-items-center rounded-md border border-[#8c6746] bg-[#463126] shadow-inner sm:size-16 md:size-20">
                  <img alt="" className="size-7 object-contain sm:size-12 md:size-16" src={rowRewardImages[value]} />
                  <span className="absolute -bottom-1 -right-1 whitespace-pre-line rounded bg-souls-void/90 px-1 text-right text-[8px] font-black leading-3 text-souls-gold sm:px-1.5 sm:text-[10px]">
                    {rowRewardCounts[value]}
                  </span>
                </span>
                {rowOrder.includes(value) && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-souls-gold text-xs font-black text-souls-void sm:size-6 sm:text-sm">
                    {rowOrder.indexOf(value) + 1}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
      <aside className="rounded border border-souls-spirit/20 bg-souls-night/75 p-4 md:p-5">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-souls-spirit">Current step</p>
        <h2 className="mt-1 text-2xl font-black">{prompt}</h2>
        <p className="mt-2 text-sm leading-relaxed text-souls-panel/75">{detail}</p>
        {step === "play" && (
          <div className="mt-5 space-y-2">
            {recommendations.map((placement, index) => {
              const usefulness = bestScore === 0 ? 0 : Math.round((placement.score / bestScore) * 100);
              return (
                <button
                  className="flex w-full items-center gap-3 rounded border border-souls-spirit/20 bg-souls-void/45 p-2.5 text-left transition hover:border-souls-gold data-[selected=true]:border-souls-gold data-[selected=true]:bg-souls-gold/10"
                  data-selected={selectedPlacement?.shape.id === placement.shape.id}
                  key={placement.shape.id}
                  onClick={() => onSelectShape(placement)}
                  type="button"
                >
                  <span className="text-sm font-black text-souls-gold">#{index + 1}</span>
                  <ShapePreview shape={placement.shape} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{placement.shape.name}</span>
                    <span className="block text-xs text-souls-panel/60">{placement.shape.hint}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-base font-black text-souls-gold">{usefulness}%</span>
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-souls-panel/55">
                      usefulness
                    </span>
                  </span>
                </button>
              );
            })}
            {recommendations.length === 0 && (
              <div className="rounded border border-souls-leaf/45 bg-souls-leaf/10 p-3 text-sm leading-relaxed text-souls-panel">
                All board tiles are already flipped. Start a new round whenever you are ready.
              </div>
            )}
          </div>
        )}
        {step === "play" && selectedPlacement && (
          <div className="mt-4 rounded border border-souls-gold/30 bg-souls-gold/10 p-3">
            <p className="text-sm font-bold">
              Place at row {selectedPlacement.anchor[0] + 1}, column {selectedPlacement.anchor[1] + 1}
            </p>
            <button
              className="mt-3 flex w-full items-center justify-center gap-2 rounded bg-souls-gold px-3 py-2.5 text-sm font-bold text-souls-void"
              onClick={onNext}
              type="button"
            >
              <Check className="size-4" /> Next recommendation
            </button>
          </div>
        )}
        {step === "complete" && (
          <div className="mt-5 space-y-2">
            <button
              className="flex w-full items-center justify-center gap-2 rounded bg-souls-gold px-3 py-2.5 text-sm font-bold text-souls-void"
              onClick={onContinue}
              type="button"
            >
              Continue to 100% <ChevronRight className="size-4" />
            </button>
            <button
              className="flex w-full items-center justify-center gap-2 rounded border border-souls-spirit/25 px-3 py-2.5 text-sm font-bold text-souls-panel"
              onClick={onReset}
              type="button"
            >
              <RotateCcw className="size-4" /> Start over
            </button>
          </div>
        )}
        {step !== "complete" && (
          <button
            className="mt-5 inline-flex items-center gap-2 text-sm text-souls-panel/65 hover:text-souls-gold"
            onClick={onReset}
            type="button"
          >
            <RotateCcw className="size-4" /> Start over
          </button>
        )}
      </aside>
    </div>
  );
}
function ShapePreview({ shape }: { shape: Shape }) {
  return <img alt={`${shape.name} block`} className="h-12 w-16 object-contain" src={shape.imageUrl} />;
}
