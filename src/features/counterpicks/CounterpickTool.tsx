import { Link } from "@tanstack/react-router";
import { Search, ShieldAlert, Users, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getCounterpickResults } from "./utils";
import { heroes, type Hero, type HeroId } from "../../heroes/heroes";

type Mode = "single" | "team";

const MAX_TEAM_SIZE = 5;
const allHeroes = heroes as Hero[];

export function CounterpickTool() {
  const appIconUrl = `${import.meta.env.BASE_URL}brand/favicon.png`;
  const [mode, setMode] = useState<Mode>("single");
  const [targetIds, setTargetIds] = useState<HeroId[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const selectedTargets = useMemo(
    () => targetIds.map((id) => allHeroes.find((hero) => hero.id === id)).filter((hero): hero is Hero => Boolean(hero)),
    [targetIds],
  );
  const results = useMemo(() => getCounterpickResults(allHeroes, targetIds), [targetIds]);

  function setModeAndReset(nextMode: Mode) {
    setMode(nextMode);
    setTargetIds((current) => (nextMode === "single" ? current.slice(0, 1) : current));
  }

  function selectHero(heroId: HeroId) {
    if (mode === "single") {
      setTargetIds((current) => (current[0] === heroId ? [] : [heroId]));
      setIsPickerOpen(false);
      return;
    }

    setTargetIds((current) => {
      if (current.includes(heroId)) {
        return current.filter((id) => id !== heroId);
      }
      return current.length < MAX_TEAM_SIZE ? [...current, heroId] : current;
    });
  }

  return (
    <main className="min-h-screen bg-souls-void text-souls-parchment">
      <section className="hero-shell min-h-screen py-4">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <nav className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded border border-souls-spirit/30 bg-souls-spirit/10">
                <img alt="Souls icon" className="size-6 object-contain" src={appIconUrl} />
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-souls-panel">
                Souls Artifacts
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <NavLink to="/">Artifacts</NavLink>
              <NavLink to="/soul-stone-calculator">Soul Stone Calculator</NavLink>
              <NavLink to="/heroes">Heroes</NavLink>
              <NavLink isActive to="/counterpick">
                Counterpick
              </NavLink>
              <NavLink to="/support">Support</NavLink>
            </div>
          </nav>

          <section className="artifact-preview p-3 md:p-4">
            <div className="border-b border-souls-spirit/20 pb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-souls-spirit">
                Matchup reference
              </p>
              <h1 className="mt-0.5 text-3xl font-black text-souls-parchment">Counterpick</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-souls-panel/85">
                This is a hero counterpick reference, not a ready-made team setup. Use the results as a starting point,
                then build around your roster, artifacts, and battle context.
              </p>
            </div>

            <div className="mt-3 rounded border border-souls-spirit/20 bg-souls-void/45 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex rounded border border-souls-spirit/20 p-1">
                  <ModeButton
                    active={mode === "single"}
                    icon={<ShieldAlert className="size-4" />}
                    onClick={() => setModeAndReset("single")}
                  >
                    Single Hero
                  </ModeButton>
                  <ModeButton
                    active={mode === "team"}
                    icon={<Users className="size-4" />}
                    onClick={() => setModeAndReset("team")}
                  >
                    Team
                  </ModeButton>
                </div>
              </div>

              <TargetSelector mode={mode} onClick={() => setIsPickerOpen(true)} selectedTargets={selectedTargets} />
            </div>

            <section className="mt-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-souls-parchment">Counterpick heroes</h2>
                {mode === "team" && results.length ? (
                  <span className="text-xs text-souls-spirit">Combined score</span>
                ) : null}
              </div>
              {targetIds.length === 0 ? (
                <EmptyState message="Select target heroes to view their counterpick reference." />
              ) : results.length === 0 ? (
                <EmptyState message="No counterpick links are available for these heroes yet." />
              ) : (
                <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
                  {results.map(({ hero, score }) => (
                    <CounterpickCard hero={hero} key={hero.id} score={score} />
                  ))}
                </div>
              )}
            </section>
          </section>
        </div>
      </section>
      {isPickerOpen && typeof document !== "undefined"
        ? createPortal(
            <HeroPickerModal
              mode={mode}
              onClose={() => setIsPickerOpen(false)}
              onSelect={selectHero}
              selectedIds={targetIds}
            />,
            document.body,
          )
        : null}
    </main>
  );
}

function HeroPickerModal({
  mode,
  onClose,
  onSelect,
  selectedIds,
}: {
  mode: Mode;
  onClose: () => void;
  onSelect: (id: HeroId) => void;
  selectedIds: HeroId[];
}) {
  const [query, setQuery] = useState("");
  const filteredHeroes = useMemo(
    () => allHeroes.filter((hero) => hero.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );
  const canAddMore = mode === "single" || selectedIds.length < MAX_TEAM_SIZE;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-souls-void/80 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <section
        aria-modal="true"
        className="max-h-[min(760px,calc(100vh-2rem))] w-full max-w-3xl overflow-hidden rounded border border-souls-spirit/35 bg-souls-night shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-souls-spirit/20 p-4">
          <div>
            <h2 className="font-black text-souls-parchment">Choose target heroes</h2>
            <p className="mt-0.5 text-xs text-souls-panel/70">
              {mode === "single" ? "Choose one target." : `Choose up to ${MAX_TEAM_SIZE} targets.`}
            </p>
          </div>
          <button
            aria-label="Close hero picker"
            className="rounded p-1 text-souls-panel transition hover:bg-souls-spirit/15"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="border-b border-souls-spirit/15 p-3">
          <label className="flex items-center gap-2 rounded border border-souls-spirit/25 bg-souls-void/60 px-3 py-2 text-souls-parchment transition focus-within:border-souls-spirit focus-within:ring-1 focus-within:ring-souls-spirit/45 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
            <Search className="size-4 text-souls-spirit" />
            <input
              autoFocus
              className="w-full bg-transparent text-sm text-souls-parchment outline-none placeholder:text-souls-panel/70 disabled:cursor-not-allowed disabled:text-souls-panel/55"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search hero"
              value={query}
            />
          </label>
        </div>
        <div className="max-h-[calc(min(760px,100vh-2rem)-10rem)] overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {filteredHeroes.map((hero) => {
              const isSelected = selectedIds.includes(hero.id);
              const disabled = !isSelected && !canAddMore;
              return (
                <button
                  className="flex items-center gap-2 rounded border border-souls-spirit/18 bg-souls-void/45 p-2 text-left transition hover:border-souls-gold disabled:cursor-not-allowed disabled:opacity-45 data-[selected=true]:border-souls-gold data-[selected=true]:bg-souls-gold/10"
                  data-selected={isSelected}
                  disabled={disabled}
                  key={hero.id}
                  onClick={() => onSelect(hero.id)}
                  type="button"
                >
                  <img alt="" className="size-9 rounded object-cover hero-portrait" src={hero.imageUrl} />
                  <span className="min-w-0 truncate text-sm font-semibold text-souls-panel">{hero.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function CounterpickCard({ hero, score }: { hero: Hero; score: number }) {
  return (
    <article className="hero-card">
      <div className="hero-portrait aspect-square w-full rounded bg-souls-void/55 p-1">
        <img alt="" className="size-full object-contain" src={hero.imageUrl} />
      </div>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-souls-parchment">{hero.name}</h3>
          <p className="text-xs capitalize text-souls-panel/65">
            {hero.race} · {hero.role}
          </p>
        </div>
        <span className="rounded border border-souls-gold/45 bg-souls-gold/10 px-1.5 py-0.5 text-xs font-black text-souls-gold">
          {score}
        </span>
      </div>
    </article>
  );
}

function TargetSelector({
  mode,
  onClick,
  selectedTargets,
}: {
  mode: Mode;
  onClick: () => void;
  selectedTargets: Hero[];
}) {
  const isTeam = mode === "team";

  return (
    <button
      aria-label={isTeam ? "Choose target team" : "Choose target hero"}
      className="mx-auto mt-4 flex min-h-32 w-full max-w-3xl flex-col items-center justify-center rounded border border-dashed border-souls-spirit/45 bg-souls-night/55 p-4 text-center transition hover:border-souls-gold hover:bg-souls-gold/10 focus-visible:border-souls-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-souls-gold/55"
      onClick={onClick}
      type="button"
    >
      {selectedTargets.length ? (
        <>
          <div className={isTeam ? "grid w-full grid-cols-5 gap-2" : "flex justify-center"}>
            {(isTeam
              ? Array.from({ length: MAX_TEAM_SIZE }, (_, index) => selectedTargets[index] ?? null)
              : [selectedTargets[0]]
            ).map((hero, index) => (
              <div
                className="flex min-w-0 flex-col items-center gap-1 rounded border border-souls-spirit/25 bg-souls-void/50 p-1.5"
                key={hero?.id ?? `empty-${index}`}
              >
                {hero ? (
                  <>
                    <img
                      alt=""
                      className={
                        isTeam
                          ? "size-16 rounded object-contain hero-portrait"
                          : "size-24 rounded object-contain hero-portrait"
                      }
                      src={hero.imageUrl}
                    />
                    <span className="truncate text-xs font-semibold text-souls-panel">{hero.name}</span>
                  </>
                ) : (
                  <span className="grid size-16 place-items-center text-2xl font-light text-souls-spirit/70">+</span>
                )}
              </div>
            ))}
          </div>
          <span className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-souls-spirit">
            Click to change {isTeam ? `targets (${selectedTargets.length}/${MAX_TEAM_SIZE})` : "target hero"}
          </span>
        </>
      ) : (
        <>
          <Search className="size-7 text-souls-gold" />
          <span className="mt-2 text-base font-black text-souls-parchment">
            {isTeam ? "Choose target team" : "Choose target hero"}
          </span>
          <span className="mt-1 text-sm text-souls-panel/70">
            {isTeam ? `Select up to ${MAX_TEAM_SIZE} enemy heroes.` : "Select a hero to see available counterpicks."}
          </span>
        </>
      )}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded border border-dashed border-souls-spirit/20 bg-souls-void/35 p-6 text-sm text-souls-panel/70">
      {message}
    </div>
  );
}

function ModeButton({
  active,
  children,
  icon,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-8 items-center gap-1.5 rounded px-2.5 text-sm font-medium text-souls-panel transition data-[active=true]:bg-souls-spirit data-[active=true]:text-souls-void"
      data-active={active}
      onClick={onClick}
      type="button"
    >
      {icon}
      {children}
    </button>
  );
}

function NavLink({
  children,
  isActive = false,
  to,
}: {
  children: ReactNode;
  isActive?: boolean;
  to: "/" | "/soul-stone-calculator" | "/heroes" | "/counterpick" | "/support";
}) {
  return (
    <Link
      className={
        isActive
          ? "rounded border border-souls-gold bg-souls-gold px-3 py-1.5 text-sm font-medium text-souls-void"
          : "rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
      }
      to={to}
    >
      {children}
    </Link>
  );
}
