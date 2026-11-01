import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const navItems = [
  ["/", "Artifacts"],
  ["/soul-stone-calculator", "Soul Stone Calculator"],
  ["/heroes", "Heroes"],
  ["/team-builder", "Team Builder"],
  ["/counterpick", "Counterpick"],
  ["/events", "Events"],
  ["/support", "Support"],
] as const;

type AppHeaderProps = { activePath: (typeof navItems)[number][0] | "/relics" };

export function AppHeader({ activePath }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();
  const activeLabel = navItems.find(([path]) => path === activePath)?.[1] ?? "Relics";

  useEffect(() => {
    setMenuOpen(false);
  }, [activePath]);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className="relative z-40 mb-4 flex items-center justify-between gap-2 lg:flex-wrap lg:gap-3"
    >
      <div className="flex shrink-0 items-center gap-2 lg:gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded border border-souls-spirit/30 bg-souls-spirit/10 lg:size-11">
          <img
            alt="Souls icon"
            className="size-6 object-contain"
            src={`${import.meta.env.BASE_URL}brand/favicon.png`}
          />
        </div>
        <span className="text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-souls-panel lg:text-sm lg:tracking-[0.24em]">
          Souls <span className="block lg:inline">Artifacts</span>
        </span>
      </div>
      <button
        ref={toggleRef}
        type="button"
        aria-label="Navigation menu"
        aria-controls={menuId}
        aria-expanded={menuOpen}
        className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded border border-souls-spirit/30 bg-souls-night px-2.5 text-sm font-medium text-souls-parchment transition hover:border-souls-gold lg:hidden"
        onClick={() => setMenuOpen((current) => !current)}
      >
        <Menu className="size-4 shrink-0" />
        <span className="max-w-28 truncate sm:max-w-48">{activeLabel}</span>
        <ChevronDown className={`size-3.5 shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
      </button>
      {menuOpen && (
        <nav
          id={menuId}
          aria-label="Mobile navigation"
          className="absolute right-0 top-full mt-2 grid w-[min(18rem,calc(100vw-2.5rem))] gap-1 rounded-lg border border-souls-spirit/30 bg-souls-night p-2 shadow-2xl lg:hidden"
        >
          {navItems.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              aria-current={to === activePath ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
              className={`flex min-h-11 items-center rounded px-3 text-sm font-medium transition ${
                to === activePath
                  ? "bg-souls-gold text-souls-void"
                  : "text-souls-panel hover:bg-souls-spirit/10 hover:text-souls-gold"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
      <nav aria-label="Main navigation" className="hidden flex-wrap items-center justify-end gap-2 lg:flex">
        {navItems.map(([to, label]) => (
          <Link
            className={
              to === activePath
                ? "rounded border border-souls-gold bg-souls-gold px-3 py-1.5 text-sm font-medium text-souls-void"
                : "rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
            }
            key={to}
            to={to}
            aria-current={to === activePath ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
