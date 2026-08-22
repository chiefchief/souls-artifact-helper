import { Link, createFileRoute } from "@tanstack/react-router";
import { Construction, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

// The disabled Counterpick tool is preserved in features/counterpicks/CounterpickTool.tsx.
export const Route = createFileRoute("/counterpick")({
  component: CounterpickPage,
});

function CounterpickPage() {
  const appIconUrl = `${import.meta.env.BASE_URL}brand/favicon.png`;

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

          <section className="artifact-preview relative isolate overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(126,212,255,0.24),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(185,129,255,0.18),transparent_34%)]" />
            <div className="mx-auto grid size-20 place-items-center rounded-full border border-souls-gold/45 bg-souls-gold/10 text-souls-gold shadow-[0_0_45px_rgba(246,200,95,0.18)]">
              <Construction className="size-10" strokeWidth={1.5} />
            </div>
            <p className="mt-7 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-souls-spirit">
              <Sparkles className="size-4" />
              New tool
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-souls-parchment sm:text-5xl">
              Counterpick is in progress
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-souls-panel/85 sm:text-lg">
              We are building an easy way to find hero counterpicks. Please check back soon — this page will be
              available when it is ready.
            </p>
            <Link
              className="mt-8 inline-flex rounded border border-souls-gold bg-souls-gold px-5 py-2.5 text-sm font-bold text-souls-void transition hover:brightness-110"
              to="/heroes"
            >
              Browse heroes
            </Link>
          </section>
        </div>
      </section>
    </main>
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
