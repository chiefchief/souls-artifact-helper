import { Link } from "@tanstack/react-router";

export function AppFooter() {
  return (
    <footer className="border-t border-souls-spirit/20 bg-souls-void text-souls-panel">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div>
          <Link className="text-sm font-semibold uppercase tracking-[0.2em] transition hover:text-souls-gold" to="/">
            Souls Artifacts
          </Link>
          <p className="mt-2 text-xs leading-relaxed text-souls-panel/65">Tools for the SOULS community.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link
            className="transition hover:text-souls-gold"
            activeProps={{ className: "text-souls-gold" }}
            to="/relics"
          >
            Relics
          </Link>
          <Link className="transition hover:text-souls-gold" to="/support">
            Support the project
          </Link>
          <a
            className="transition hover:text-souls-gold"
            href="https://discordapp.com/users/387369366699638784"
            rel="noreferrer"
            target="_blank"
          >
            Contact on Discord
          </a>
        </nav>
      </div>
    </footer>
  );
}
