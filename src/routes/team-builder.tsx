import { Link, createFileRoute } from "@tanstack/react-router";
import { TeamBuilder } from "../features/team-builder/TeamBuilder";

export const Route = createFileRoute("/team-builder")({ component: TeamBuilderPage });

function TeamBuilderPage() {
  return (
    <main className="hero-shell min-h-screen text-souls-parchment py-4">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="text-sm font-semibold uppercase tracking-[0.24em]">
            Souls Artifacts
          </Link>
          <div className="flex flex-wrap gap-2">
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
                    : "rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium hover:border-souls-gold"
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
