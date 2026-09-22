import { Link } from "@tanstack/react-router";

const navItems = [
  ["/", "Artifacts"],
  ["/soul-stone-calculator", "Soul Stone Calculator"],
  ["/heroes", "Heroes"],
  ["/team-builder", "Team Builder"],
  ["/counterpick", "Counterpick"],
  ["/events", "Events"],
  ["/support", "Support"],
] as const;

type AppHeaderProps = { activePath: (typeof navItems)[number][0] };

export function AppHeader({ activePath }: AppHeaderProps) {
  return (
    <nav className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded border border-souls-spirit/30 bg-souls-spirit/10">
          <img alt="Souls icon" className="size-6 object-contain" src={`${import.meta.env.BASE_URL}brand/favicon.png`} />
        </div>
        <span className="text-sm font-semibold uppercase tracking-[0.24em] text-souls-panel">Souls Artifacts</span>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {navItems.map(([to, label]) => (
          <Link
            className={
              to === activePath
                ? "rounded border border-souls-gold bg-souls-gold px-3 py-1.5 text-sm font-medium text-souls-void"
                : "rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
            }
            key={to}
            to={to}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
