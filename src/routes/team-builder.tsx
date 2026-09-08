import { Link, createFileRoute } from "@tanstack/react-router";
import { TeamBuilder } from "../features/team-builder/TeamBuilder";

export const Route = createFileRoute("/team-builder")({ component: TeamBuilderPage });

function TeamBuilderPage() {
  return (
    <main className="hero-shell min-h-screen text-souls-parchment py-4">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <nav className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded border border-souls-spirit/30 bg-souls-spirit/10">
              <img
                alt="Souls icon"
                className="size-6 object-contain"
                src={`${import.meta.env.BASE_URL}brand/favicon.png`}
              />
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-souls-panel">Souls Artifacts</span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {(
              [
                ["/", "Artifacts"],
                ["/soul-stone-calculator", "Soul Stone Calculator"],
                ["/heroes", "Heroes"],
                ["/team-builder", "Team Builder"],
                ["/counterpick", "Counterpick"],
                ["/support", "Support"],
              ] as const
            ).map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className={
                  to === "/team-builder"
                    ? "rounded border border-souls-gold bg-souls-gold px-3 py-1.5 text-sm font-medium text-souls-void"
                    : "rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                }
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
        <TeamBuilder />
      </div>
    </main>
  );
}
