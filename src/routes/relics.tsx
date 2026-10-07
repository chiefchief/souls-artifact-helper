import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { calculateRelicProgress, calculateRelicResources, relicResources } from "../lib/relicUpgradeCosts";

import { relicStats, type RelicSlot } from "../data/relicStatBonuses";
import { calculateRelicStatProgress } from "../lib/relicStatBonuses";

export const Route = createFileRoute("/relics")({
  component: RelicsPage,
});

const relicGroups = [
  {
    id: "strength",
    name: "Strength",
    color: "text-souls-ember",
    relics: [
      { id: "sword-of-judgment", name: "Sword of Judgment", image: "sword-of-judgment/IconHeritage_11001_1.png" },
      { id: "protective-shield", name: "Protective Shield", image: "protective-shield/IconHeritage_11002_1.png" },
      { id: "seal-of-judgment", name: "Seal of Judgment", image: "seal-of-judgment/IconSeal_21001_1.png" },
      { id: "seal-of-protection", name: "Seal of Protection", image: "seal-of-protection/IconSeal_21002_1.png" },
    ],
  },
  {
    id: "agility",
    name: "Agility",
    color: "text-souls-leaf",
    relics: [
      { id: "piercing-bow", name: "Piercing Bow", image: "piercing-bow/IconHeritage_12001_1.png" },
      { id: "bracers-of-wind", name: "Bracers of Wind", image: "breacers-of-wind/IconHeritage_12002_1.png" },
      { id: "seal-of-piercing", name: "Seal of Piercing", image: "seal-of-piercing/IconSeal_22001_1.png" },
      { id: "seal-of-wind", name: "Seal of Wind", image: "seal-of-wind/IconSeal_22002_1.png" },
    ],
  },
  {
    id: "intelligence",
    name: "Intelligence",
    color: "text-souls-spirit",
    relics: [
      { id: "orb-of-truth", name: "Orb of Truth", image: "orb-of-truth/IconHeritage_13001_1.png" },
      { id: "circlet-of-the-king", name: "Circlet of the King", image: "circlet-of-the-king/IconHeritage_13002_1.png" },
      { id: "seal-of-truth", name: "Seal of Truth", image: "seal-of-truth/IconSeal_23001_1.png" },
      { id: "seal-of-the-king", name: "Seal of the King", image: "seal-of-the-king/IconSeal_23002_1.png" },
    ],
  },
] as const;

const levelOptions = Array.from({ length: 61 }, (_, level) => level);
type RelicLevels = { current: number; target: number };

function RelicLevelPicker({
  name,
  levels,
  onChange,
}: {
  name: string;
  levels: RelicLevels;
  onChange: (field: keyof RelicLevels, value: number) => void;
}) {
  const [activeField, setActiveField] = useState<keyof RelicLevels | null>(null);
  const pickerId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0, height: 336 });

  useLayoutEffect(() => {
    if (!activeField) return;
    function updatePosition() {
      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const viewport = window.visualViewport;
      const viewportLeft = viewport?.offsetLeft ?? 0;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const width = Math.min(400, viewportWidth - 32);
      const height = Math.min(336, viewportHeight - 32);
      const left = Math.max(viewportLeft + 16, Math.min(bounds.left, viewportLeft + viewportWidth - width - 16));
      const below = bounds.bottom + 8;
      const preferredTop = below + height <= viewportTop + viewportHeight - 16 ? below : bounds.top - height - 8;
      const top = Math.max(viewportTop + 16, Math.min(preferredTop, viewportTop + viewportHeight - height - 16));
      setPosition({ left: left - bounds.left, top: top - bounds.top, height });
      if (panelRef.current) panelRef.current.style.width = `${width}px`;
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.visualViewport?.addEventListener("resize", updatePosition);
    window.visualViewport?.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.visualViewport?.removeEventListener("resize", updatePosition);
      window.visualViewport?.removeEventListener("scroll", updatePosition);
    };
  }, [activeField]);

  useEffect(() => {
    if (!activeField) return;
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setActiveField(null);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeField]);

  function togglePicker(field: keyof RelicLevels) {
    setActiveField(activeField === field ? null : field);
  }
  const currentButton = useRef<HTMLButtonElement>(null);
  const targetButton = useRef<HTMLButtonElement>(null);

  function closePicker() {
    (activeField === "current" ? currentButton : targetButton).current?.focus();
    setActiveField(null);
  }

  return (
    <div
      ref={containerRef}
      className={`relative mt-3 ${activeField ? "z-30" : ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape" && activeField) {
          event.stopPropagation();
          closePicker();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActiveField(null);
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["current", "Current"],
            ["target", "Target"],
          ] as const
        ).map(([field, label]) => (
          <div key={field} className="min-w-0">
            <p className="mb-1 text-xs text-souls-panel/75">{label}</p>
            <button
              ref={field === "current" ? currentButton : targetButton}
              type="button"
              aria-label={`${name}: ${label}, ${levels[field]}`}
              aria-expanded={activeField === field}
              aria-controls={activeField === field ? pickerId : undefined}
              onClick={() => togglePicker(field)}
              className={`flex min-h-9 w-full items-center justify-between rounded border bg-souls-void px-2 py-1 text-base font-semibold transition focus-visible:outline-2 focus-visible:outline-souls-gold ${activeField === field ? "border-souls-gold text-souls-gold" : "border-souls-spirit/25 text-souls-parchment hover:border-souls-gold/60"}`}
            >
              {levels[field]}
              <ChevronDown
                aria-hidden="true"
                className={`size-4 transition ${activeField === field ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        ))}
      </div>
      {activeField && (
        <div
          ref={panelRef}
          id={pickerId}
          role="group"
          aria-label={`${name}: ${activeField === "current" ? "Current" : "Target"} level`}
          style={position}
          className="absolute z-40 flex flex-col w-[400px] max-w-[calc(100vw-2rem)] rounded-lg border border-souls-spirit/25 bg-souls-void p-3 shadow-2xl shadow-black/50"
        >
          <p className="px-1 pb-2 pt-1 text-xs text-souls-panel/65">
            {activeField === "current" ? "Current level" : "Target level"} · 0–60
          </p>
          <div className="grid min-h-0 flex-1 grid-cols-10 grid-rows-7 gap-1">
            {levelOptions.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={levels[activeField] === level}
                disabled={activeField === "target" && level < levels.current}
                onClick={() => {
                  onChange(activeField, level);
                  closePicker();
                }}
                className={`min-h-0 rounded text-sm tabular-nums transition disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-souls-panel focus-visible:outline-2 focus-visible:outline-souls-gold ${levels[activeField] === level ? "bg-souls-gold font-bold text-souls-void" : "text-souls-panel hover:bg-souls-spirit/15 hover:text-souls-gold"}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RelicIcon({
  name,
  image,
  attribute,
  level,
}: {
  name: string;
  image: string;
  attribute: string;
  level: number;
}) {
  const tier = level < 20 ? 1 : level < 30 ? 2 : level < 40 ? 3 : level < 50 ? 4 : level < 60 ? 5 : 6;
  const isSeal = image.includes("IconSeal_");
  const baseUrl = `${import.meta.env.BASE_URL}relics/`;
  const icon = image.replace(/_1\.png$/, `_${tier}.png`);
  const background =
    attribute === "strength"
      ? "radial-gradient(circle at 40% 35%, #94351c, #551c11 80%)"
      : attribute === "agility"
        ? "radial-gradient(circle at 40% 35%, #657d0c, #344506 80%)"
        : "radial-gradient(circle at 40% 35%, #205579, #102e48 80%)";

  return (
    <div className="relative grid size-20 shrink-0 place-items-center">
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full object-contain"
        src={`${baseUrl}overlay/${isSeal ? "seal-frame.png" : `frame_${tier}.png`}`}
      />
      {level >= 1 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute size-[62%] rounded-full shadow-[inset_0_0_6px_rgba(0,0,0,0.65)]"
          style={{ background }}
        />
      )}
      <img
        alt={`${name}, level ${level}`}
        className="relative size-12 object-contain"
        src={`${baseUrl}_${attribute}/${icon}`}
      />
    </div>
  );
}

function RelicsPage() {
  const [levels, setLevels] = useState<Record<string, RelicLevels>>({});
  const [savedTargets, setSavedTargets] = useState<Record<string, number> | null>(null);

  const totals = calculateRelicResources(
    relicGroups.flatMap((group) =>
      group.relics.map((relic) => ({
        ...(levels[relic.id] ?? { current: 0, target: 0 }),
        isSeal: relic.image.includes("IconSeal_"),
      })),
    ),
  );

  const allRelics = relicGroups.flatMap((group) => [...group.relics]);
  const progress = calculateRelicProgress(totals.spent, totals.required);
  const slots: RelicSlot[] = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
  const statTotals = calculateRelicStatProgress(
    relicGroups.flatMap((group) =>
      group.relics.map((relic, index) => ({
        slot: slots[index],
        ...(levels[relic.id] ?? { current: 0, target: 0 }),
      })),
    ),
  );
  const currentLevelTotal = allRelics.reduce((sum, relic) => sum + (levels[relic.id]?.current ?? 0), 0);
  const targetLevelTotal = allRelics.reduce((sum, relic) => sum + (levels[relic.id]?.target ?? 0), 0);
  const levelProgress = targetLevelTotal ? (currentLevelTotal / targetLevelTotal) * 100 : 0;
  function toggleMaxTargets() {
    if (savedTargets) {
      setLevels((previous) =>
        Object.fromEntries(
          allRelics.map((relic) => {
            const current = previous[relic.id]?.current ?? 0;
            return [relic.id, { current, target: Math.max(current, savedTargets[relic.id] ?? 0) }];
          }),
        ),
      );
      setSavedTargets(null);
    } else {
      setSavedTargets(Object.fromEntries(allRelics.map((relic) => [relic.id, levels[relic.id]?.target ?? 0])));
      setLevels((previous) =>
        Object.fromEntries(
          allRelics.map((relic) => [relic.id, { current: previous[relic.id]?.current ?? 0, target: 60 }]),
        ),
      );
    }
  }

  function updateLevel(id: string, field: keyof RelicLevels, value: number) {
    setLevels((previous) => {
      const existing = previous[id] ?? { current: 0, target: 0 };
      if (!Number.isInteger(value) || value < 0 || value > 60) return previous;
      const next =
        field === "current"
          ? { current: value, target: Math.max(existing.target, value) }
          : { ...existing, target: value };
      if (next.current > next.target) return previous;
      return { ...previous, [id]: next };
    });
  }

  return (
    <main className="min-h-screen bg-souls-void text-souls-parchment">
      <section className="hero-shell min-h-screen py-4">
        <div className="mx-auto w-full max-w-[1600px] px-5 md:px-8">
          <AppHeader activePath="/relics" />
          <section className="artifact-preview p-5 md:p-6">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={toggleMaxTargets}
                aria-pressed={savedTargets !== null}
                className="rounded border border-souls-spirit/25 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:text-souls-gold focus-visible:outline-2 focus-visible:outline-souls-gold disabled:cursor-default disabled:opacity-40"
              >
                {savedTargets ? "Reset max target" : "Max target"}
              </button>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {relicGroups.map((group) => (
                <section
                  key={group.id}
                  aria-labelledby={`${group.id}-heading`}
                  className="min-w-0 rounded-lg border border-souls-spirit/20 bg-souls-void/35 p-4"
                >
                  <h2 id={`${group.id}-heading`} className={`mb-3 text-center text-2xl font-bold ${group.color}`}>
                    {group.name}
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {group.relics.map((relic) => (
                      <article
                        key={relic.id}
                        className="rounded-lg border border-souls-spirit/15 bg-souls-night/80 p-2.5"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <RelicIcon
                            name={relic.name}
                            image={relic.image}
                            attribute={group.id}
                            level={levels[relic.id]?.current ?? 0}
                          />
                          <h3 className="text-center text-sm font-semibold">{relic.name}</h3>
                        </div>
                        <RelicLevelPicker
                          name={relic.name}
                          levels={levels[relic.id] ?? { current: 0, target: 0 }}
                          onChange={(field, value) => updateLevel(relic.id, field, value)}
                        />
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                { title: "Resources", value: progress, description: "Average spent / total target cost per resource" },
                {
                  title: "Levels",
                  value: levelProgress,
                  description: `${currentLevelTotal} / ${targetLevelTotal} target levels`,
                },
                {
                  title: "Attributes",
                  value: statTotals.progress,
                  description: "Average current / target bonus per stat",
                },
              ].map(({ title, value, description }) => (
                <section key={title} className="rounded-lg border border-souls-spirit/20 bg-souls-void/45 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <h2 className="font-semibold text-souls-panel">{title}</h2>
                    <span className="font-semibold tabular-nums text-souls-gold">
                      {value === null ? "—" : `${value.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`}
                    </span>
                  </div>
                  {value !== null && (
                    <div
                      role="progressbar"
                      aria-label={`${title} progress toward selected targets`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={value}
                      className="h-1.5 overflow-hidden rounded-full bg-souls-void"
                    >
                      <div
                        className="h-full rounded-full bg-souls-gold transition-[width]"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-souls-panel/55">{description}</p>
                  {title === "Attributes" && (
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-souls-panel/75">
                      {relicStats.map(({ id, label, unit }) => (
                        <div key={id} className="flex justify-between gap-1">
                          <dt>{label}</dt>
                          <dd className="tabular-nums">
                            {statTotals.current[id].toLocaleString("en-US", { maximumFractionDigits: 1 })}
                            {unit} / {statTotals.target[id].toLocaleString("en-US", { maximumFractionDigits: 1 })}
                            {unit}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </section>
              ))}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {(
                [
                  ["spent", "Spent", "Estimated resources used to reach current levels."],
                  ["required", "Required", "Resources needed to reach target levels."],
                ] as const
              ).map(([key, title, description]) => (
                <section
                  key={key}
                  aria-labelledby={`${key}-resources-heading`}
                  className="rounded-lg border border-souls-spirit/20 bg-souls-void/45 p-4"
                >
                  <h2
                    id={`${key}-resources-heading`}
                    className={`text-lg font-bold ${key === "required" ? "text-souls-gold" : "text-souls-panel"}`}
                  >
                    {title}
                  </h2>
                  <p className="mt-1 text-xs text-souls-panel/65">{description}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {relicResources.map((resource) => (
                      <div key={resource.id} className="flex min-w-0 items-center gap-2 rounded bg-souls-night/70 p-2">
                        <img
                          alt=""
                          className="size-9 shrink-0 object-contain"
                          src={`${import.meta.env.BASE_URL}relics/resources/${resource.image}`}
                        />
                        <div className="min-w-0">
                          <dt className="text-[10px] leading-tight text-souls-panel/65">{resource.name}</dt>
                          <dd className="mt-1 text-sm font-semibold tabular-nums">
                            {totals[key][resource.id].toLocaleString("en-US")}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
