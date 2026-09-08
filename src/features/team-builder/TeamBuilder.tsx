import { exportFormationImage } from "./exportImage";
import { NotificationToast } from "../../components/NotificationToast";
import { useEffect, useState, useRef, type PointerEvent } from "react";
import { ArrowDownUp, PawPrint, Plus, Search, Shield, Swords, X, Share2, Camera, Download } from "lucide-react";
import { heroes } from "../../heroes/heroes";
import { pets } from "../../pets/pets";
import { emptyTeam, placeHero, restoreMatchup, shareMatchup, readSharedMatchup, type Matchup } from "./state";
import "./team-builder.css";

const STORAGE_KEY = "souls-team-builder-v1";
const heroIds = new Set(heroes.map((hero) => String(hero.id)));
const petIds = new Set(pets.map((pet) => pet.id));
const rows = [
  [0, 1, 2],
  [3, 4],
  [5, 6, 7],
];
type Selection = { side: keyof Matchup; slot: number | "pet" };
const sideName = { enemy: "Enemy", ally: "Allied" };

export function TeamBuilder() {
  const [matchup, setMatchup] = useState(() => {
    try {
      return (
        readSharedMatchup(window.location.hash, heroIds, petIds) ??
        restoreMatchup(localStorage.getItem(STORAGE_KEY), heroIds, petIds)
      );
    } catch {
      return restoreMatchup(null, heroIds, petIds);
    }
  });
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 850px)").matches,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 850px)");
    const update = () => {
      setIsMobile(media.matches);
      setPickerOpen(false);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const dialog = pickerDialog.current;
    if (!isMobile || !pickerOpen || !dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, pickerOpen]);
  const [exportUrl, setExportUrl] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const exportDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!exportUrl) return;
    exportDialog.current?.showModal();
    return () => {
      exportDialog.current?.close();
      URL.revokeObjectURL(exportUrl);
    };
  }, [exportUrl]);
  async function createScreenshot() {
    setExporting(true);
    setExportError("");
    try {
      setExportUrl(URL.createObjectURL(await exportFormationImage(matchup, heroes, pets)));
    } catch {
      setExportError("Could not create the image. Please try again.");
    } finally {
      setExporting(false);
    }
  }
  const [selection, setSelection] = useState<Selection>({ side: "ally", slot: 0 });
  const [hasSelection, setHasSelection] = useState(true);
  useEffect(() => {
    const clearSelection = (event: globalThis.PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        event.target.closest(".formation-slot, .cell-actions, .formation-picker, .mobile-picker-dialog")
      )
        return;
      setHasSelection(false);
    };
    document.addEventListener("pointerdown", clearSelection);
    return () => document.removeEventListener("pointerdown", clearSelection);
  }, []);

  const [query, setQuery] = useState("");
  const [race, setRace] = useState("all");
  const drag = useRef<{ side: keyof Matchup; slot: number; x: number; y: number; active: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<Selection | null>(null);
  const [moving, setMoving] = useState<Selection | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [showCopied, setShowCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [],
  );
  useEffect(() => {
    const loadShared = () => {
      const shared = readSharedMatchup(window.location.hash, heroIds, petIds);
      if (shared) {
        setMatchup(shared);
        setMoving(null);
      } else if (window.location.hash.includes("setup=")) setShareStatus("This shared setup could not be opened.");
    };
    loadShared();
    window.addEventListener("hashchange", loadShared);
    return () => window.removeEventListener("hashchange", loadShared);
  }, []);
  useEffect(() => {
    setShareUrl("");
    setShareStatus("");
  }, [matchup]);
  async function share() {
    const url = shareMatchup(matchup, window.location.href);
    setShareUrl("");
    setShareStatus("");
    setShowCopied(false);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      copiedTimer.current = setTimeout(() => setShowCopied(false), 3000);
    } catch {
      setShareUrl(url);
      setShareStatus("Copy the link below to share this setup.");
    }
  }
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matchup));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [matchup]);
  const team = matchup[selection.side];
  const isPet = selection.slot === "pet";
  const selectedId = hasSelection ? (isPet ? team.petId : team.slots[selection.slot as number]) : null;
  const full = team.slots.filter(Boolean).length >= 5;
  const options = (isPet ? pets : heroes.filter((hero) => race === "all" || hero.race === race)).filter((item) =>
    item.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function finishDrag(event: PointerEvent<HTMLButtonElement>) {
    const source = drag.current;
    if (source?.active) {
      suppressClick.current = true;
      const target = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLButtonElement>("button[data-slot]");
      if (target?.dataset.side === source.side) {
        const slot = Number(target.dataset.slot);
        setMatchup((current) => ({
          ...current,
          [source.side]: placeHero(current[source.side], slot, current[source.side].slots[source.slot]),
        }));
        setHasSelection(true);
        setSelection({ side: source.side, slot });
      }
    }
    drag.current = null;
    setMoving(null);
    setDragPoint(null);
    setDropTarget(null);
  }

  function select(next: Selection) {
    setHasSelection(true);
    setSelection(next);
    setQuery("");
    if (isMobile) setPickerOpen(true);
  }
  function assign(id: string | null) {
    if (!hasSelection) return;
    setPickerOpen(false);
    setMoving(null);
    setMatchup((current) => ({
      ...current,
      [selection.side]: isPet
        ? { ...current[selection.side], petId: id }
        : placeHero(current[selection.side], selection.slot as number, id),
    }));
  }

  const picker = (
    <aside className="formation-picker artifact-preview p-4" aria-label="Formation selection">
      {isMobile && (
        <button
          className="mobile-picker-close formation-action"
          aria-label="Close selection"
          onClick={() => setPickerOpen(false)}
        >
          <X size={20} />
        </button>
      )}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-souls-gold">{sideName[selection.side]} team</p>
          <h2 id="formation-picker-title" className="mt-1 text-xl font-bold">
            {!hasSelection ? "Choose a position" : isPet ? "Choose a pet" : `Position ${Number(selection.slot) + 1}`}
          </h2>
        </div>
        {selectedId && (
          <button className="formation-action" aria-label="Remove selected unit" onClick={() => assign(null)}>
            <X size={16} /> Remove
          </button>
        )}
      </div>
      <p className="my-3 min-h-10 text-xs leading-relaxed text-souls-panel/65">
        {!hasSelection
          ? "Select a position on the board to add or replace a hero or pet."
          : isPet
            ? "Choose the companion for this team."
            : full && !selectedId
              ? "Team is full. Choose a hero already in this team to move them here, or remove a hero first."
              : "Choose a hero to place here. Choosing a hero already in this team moves them here, swapping occupied positions."}
      </p>
      <label className="flex items-center gap-2 rounded border border-souls-spirit/25 bg-souls-void/60 px-3 py-2">
        <Search size={16} />
        <input
          aria-label={isPet ? "Search pets" : "Search heroes"}
          className="min-w-0 w-full bg-transparent text-sm outline-none"
          placeholder={isPet ? "Search pets…" : "Search heroes…"}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {!isPet && (
        <div className="my-3 flex flex-wrap gap-1" aria-label="Filter by race">
          {["all", "human", "horde", "elf", "undead", "light", "darkness"].map((value) => (
            <button key={value} className="race-filter" aria-pressed={race === value} onClick={() => setRace(value)}>
              {value}
            </button>
          ))}
        </div>
      )}
      <div className="picker-roster mt-3">
        {options.map((item) => {
          const inTeam = !isPet && team.slots.includes(item.id);
          const disabled = !hasSelection || (!isPet && full && !selectedId && !inTeam);
          return (
            <button
              className="roster-unit"
              key={item.id}
              data-selected={selectedId === item.id}
              disabled={disabled}
              aria-pressed={selectedId === item.id}
              onClick={() => assign(item.id)}
            >
              <img src={item.imageUrl} alt="" loading="lazy" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
      {!options.length && (
        <p className="py-8 text-center text-sm text-souls-panel/60">No matches. Try another name or race.</p>
      )}
      <p className="mt-4 text-xs text-souls-panel/60" role="status">
        {saved
          ? "Saved automatically in this browser."
          : "Browser storage unavailable. Changes last until you leave this page."}
      </p>
    </aside>
  );

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-souls-gold">Battle formations</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Team Builder</h1>
          <p className="mt-2 text-sm text-souls-panel/70">
            Two sides. Five heroes and one pet each. Choose a position, then a hero.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="formation-action" disabled={exporting} onClick={createScreenshot}>
            <Camera size={16} /> {exporting ? "Creating…" : "Screenshot"}
          </button>
          <button className="formation-action" onClick={share}>
            <Share2 size={16} /> Share
          </button>
          <button
            className="formation-action"
            onClick={() => {
              setMoving(null);
              setMatchup((current) => ({ enemy: current.ally, ally: current.enemy }));
            }}
          >
            <ArrowDownUp size={16} /> Swap sides
          </button>
        </div>
      </div>
      {exportError && (
        <p role="alert" className="mb-3 text-sm text-souls-ember">
          {exportError}
        </p>
      )}
      <dialog
        ref={exportDialog}
        className="mobile-picker-dialog p-4"
        aria-label="Formation screenshot"
        onCancel={() => setExportUrl("")}
      >
        <div className="flex items-center justify-between gap-3 p-4">
          <a className="formation-action" href={exportUrl || undefined} download="souls-formation.png">
            <Download size={16} /> Save PNG
          </a>
          <button className="formation-action" aria-label="Close screenshot" onClick={() => setExportUrl("")}>
            <X size={20} />
          </button>
        </div>
        {exportUrl && <img className="w-full" src={exportUrl} alt="Enemy and allied formations" />}
        <p className="p-4 text-xs text-souls-panel/70">On mobile, you can also press and hold the image to save it.</p>
      </dialog>
      {showCopied && (
        <NotificationToast
          isLeaving={false}
          notification={{ tone: "success", message: "Link copied" }}
          onDismiss={() => setShowCopied(false)}
        />
      )}
      {shareStatus && (
        <p role="status" className="mb-3 text-sm text-souls-gold">
          {shareStatus}
        </p>
      )}
      {shareUrl && (
        <input
          aria-label="Share link"
          className="mb-4 w-full rounded border border-souls-spirit/30 p-2 text-xs"
          readOnly
          value={shareUrl}
          onFocus={(event) => event.target.select()}
        />
      )}
      {moving && dragPoint && (
        <img
          className="drag-portrait"
          src={heroes.find((hero) => hero.id === matchup[moving.side].slots[moving.slot as number])?.imageUrl}
          alt=""
          style={{ left: dragPoint.x, top: dragPoint.y }}
        />
      )}
      <div className="formation-layout">
        <div className="battle-arena">
          {(["enemy", "ally"] as const).map((side) => {
            const current = matchup[side];
            const pet = pets.find((item) => item.id === current.petId);
            const visualRows = side === "enemy" ? [...rows].reverse() : rows;
            return (
              <section className={`formation formation-${side}`} key={side} aria-label={`${sideName[side]} formation`}>
                <header className="flex items-center justify-between gap-2 px-3 sm:px-6">
                  <div className="flex items-center gap-2">
                    {side === "enemy" ? <Swords size={18} /> : <Shield size={18} />}
                    <h2 className="font-bold">{sideName[side]} team</h2>
                    <span className="text-xs opacity-70">
                      {current.slots.filter(Boolean).length}/5 · {pet ? "1/1 pet" : "0/1 pet"}
                    </span>
                  </div>
                  <button
                    className="text-xs underline underline-offset-4 disabled:opacity-30"
                    disabled={!current.slots.some(Boolean) && !pet}
                    onClick={() => {
                      setMoving(null);
                      setMatchup((value) => ({ ...value, [side]: emptyTeam() }));
                    }}
                  >
                    Clear
                  </button>
                </header>
                <div className="formation-grid">
                  {visualRows.map((row) => (
                    <div className="formation-row" key={row[0]}>
                      {row.map((slot) => {
                        const hero = heroes.find((item) => item.id === current.slots[slot]);
                        const active = hasSelection && selection.side === side && selection.slot === slot;
                        return (
                          <div className="formation-cell" key={slot}>
                            <button
                              className="formation-slot"
                              data-moving={moving?.side === side && moving.slot === slot}
                              data-drop-target={dropTarget?.side === side && dropTarget.slot === slot}
                              data-selected={active}
                              data-filled={Boolean(hero)}
                              aria-pressed={active}
                              aria-label={`${sideName[side]} position ${slot + 1}: ${hero?.name ?? "empty"}`}
                              data-side={side}
                              data-slot={slot}
                              onPointerDown={(event) => {
                                // A fresh press always starts a new click, including on empty slots.
                                // Some browsers do not emit a click after a completed drag.
                                suppressClick.current = false;
                                if (!hero || event.button !== 0) return;
                                drag.current = { side, slot, x: event.clientX, y: event.clientY, active: false };
                                event.currentTarget.setPointerCapture(event.pointerId);
                              }}
                              onPointerMove={(event) => {
                                const source = drag.current;
                                if (!source) return;
                                if (
                                  !source.active &&
                                  Math.hypot(event.clientX - source.x, event.clientY - source.y) < 8
                                )
                                  return;
                                source.active = true;
                                setMoving({ side: source.side, slot: source.slot });
                                setDragPoint({ x: event.clientX, y: event.clientY });
                                const target = document
                                  .elementFromPoint(event.clientX, event.clientY)
                                  ?.closest<HTMLButtonElement>("button[data-slot]");
                                setDropTarget(
                                  target?.dataset.side === source.side
                                    ? { side: source.side, slot: Number(target.dataset.slot) }
                                    : null,
                                );
                              }}
                              onPointerUp={finishDrag}
                              onPointerCancel={() => {
                                drag.current = null;
                                setMoving(null);
                                setDragPoint(null);
                                setDropTarget(null);
                              }}
                              onLostPointerCapture={() => {
                                drag.current = null;
                                setMoving(null);
                                setDragPoint(null);
                                setDropTarget(null);
                              }}
                              onClick={(event) => {
                                if (suppressClick.current && event.detail !== 0) {
                                  suppressClick.current = false;
                                  return;
                                }
                                select({ side, slot });
                              }}
                            >
                              {hero ? (
                                <img src={hero.imageUrl} alt="" draggable={false} />
                              ) : (
                                <Plus className="slot-plus" size={24} />
                              )}
                              {!hero && <span className="slot-name">Add hero</span>}
                            </button>
                            {hero && (
                              <div className="cell-actions">
                                <button
                                  aria-label={`Remove ${hero.name} from ${sideName[side]} position ${slot + 1}`}
                                  title="Remove hero"
                                  onClick={() => {
                                    setMoving(null);
                                    setMatchup((value) => ({ ...value, [side]: placeHero(value[side], slot, null) }));
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {row[0] === 3 && (
                        <button
                          className={`formation-slot pet-slot pet-${side}`}
                          data-selected={hasSelection && selection.side === side && isPet}
                          data-filled={Boolean(pet)}
                          aria-pressed={hasSelection && selection.side === side && isPet}
                          aria-label={`${sideName[side]} pet: ${pet?.name ?? "empty"}`}
                          onClick={() => select({ side, slot: "pet" })}
                        >
                          {pet ? <img src={pet.imageUrl} alt="" /> : <PawPrint className="slot-plus" size={25} />}
                          {!pet && <span className="slot-name">Add pet</span>}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="front-line">Front line</p>
                {side === "enemy" && (
                  <div className="battle-divider">
                    <span />
                    <Swords size={20} />
                    <span />
                  </div>
                )}
              </section>
            );
          })}
        </div>
        {isMobile ? (
          <dialog
            ref={pickerDialog}
            className="mobile-picker-dialog"
            aria-labelledby="formation-picker-title"
            onCancel={() => setPickerOpen(false)}
            onClick={(event) => {
              if (event.target === event.currentTarget) setPickerOpen(false);
            }}
          >
            {picker}
          </dialog>
        ) : (
          picker
        )}
      </div>
    </section>
  );
}
