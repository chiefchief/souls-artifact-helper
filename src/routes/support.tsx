import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/support")({
  component: SupportPage,
});

function SupportPage() {
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
              <Link
                className="rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                to="/"
              >
                Artifacts
              </Link>
              <Link
                className="rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                to="/soul-stone-calculator"
              >
                Soul Stone Calculator
              </Link>
              <Link
                className="rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                to="/heroes"
              >
                Heroes
              </Link>
              <Link
                className="rounded border border-souls-gold bg-souls-gold px-3 py-1.5 text-sm font-medium text-souls-void"
                to="/support"
              >
                Support
              </Link>
            </div>
          </nav>

          <section className="artifact-preview p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-souls-spirit">Support</p>
            <h1 className="mt-1 text-3xl font-black text-souls-parchment md:text-4xl">Questions or suggestions?</h1>
            <p className="mt-3 max-w-2xl text-sm text-souls-panel">
              If you have any questions, feedback, or feature ideas, feel free to contact me on Discord.
            </p>

            <a
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded border border-souls-gold bg-souls-gold px-4 py-2 text-sm font-semibold text-souls-void transition hover:brightness-110"
              href="http://discordapp.com/users/387369366699638784"
              rel="noreferrer"
              target="_blank"
            >
              Contact on Discord
            </a>
          </section>
        </div>
      </section>
    </main>
  );
}
