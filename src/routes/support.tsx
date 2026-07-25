import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Heart } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

const USDT_TRC20_ADDRESS = "TNc4mToEVfbGKWmsJzqWKTAtuxQdYnQeuK";

export const Route = createFileRoute("/support")({
  component: SupportPage,
});

function SupportPage() {
  const appIconUrl = `${import.meta.env.BASE_URL}brand/favicon.png`;
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    void QRCode.toDataURL(USDT_TRC20_ADDRESS, {
      color: { dark: "#111522", light: "#fff8ea" },
      errorCorrectionLevel: "M",
      margin: 1,
      width: 180,
    }).then(setQrCodeUrl);
  }, []);

  async function copyAddress() {
    await navigator.clipboard.writeText(USDT_TRC20_ADDRESS);
    setIsAddressCopied(true);
    window.setTimeout(() => setIsAddressCopied(false), 2_000);
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
                className="rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
                to="/counterpick"
              >
                Counterpick
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
            <p className="mt-3 max-w-2xl text-sm text-souls-panel/85">
              Reach out with feedback or feature ideas, or help keep this project growing.
            </p>

            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              <section className="rounded border border-souls-spirit/25 bg-souls-void/45 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-souls-spirit">Contact</p>
                <h2 className="mt-2 text-xl font-black text-souls-parchment">Let&apos;s make it better</h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-souls-panel/80">
                  Have a question, found an issue, or have an idea for a new feature? I would be happy to hear from you.
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

              <section className="relative overflow-hidden rounded border border-souls-gold/35 bg-[linear-gradient(135deg,rgba(246,200,95,0.13),rgba(29,36,53,0.82)_48%,rgba(126,212,255,0.12))] p-5">
                <div className="absolute -right-8 -top-8 size-32 rounded-full bg-souls-gold/10 blur-2xl" />
                <div className="relative flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded border border-souls-gold/40 bg-souls-gold/10 text-souls-gold">
                    <Heart className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-souls-gold">Optional support</p>
                    <h2 className="mt-1 text-xl font-black text-souls-parchment">Support the project</h2>
                    <p className="mt-2 text-sm leading-relaxed text-souls-panel/80">
                      If this tool has been useful, you can support its development with USDT on the TRON network.
                    </p>
                  </div>
                </div>
                <div className="relative mt-4 flex flex-col gap-4 rounded border border-souls-spirit/20 bg-souls-night/70 p-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-souls-spirit">USDT · TRC20 network</p>
                    <div className="mt-2 flex flex-col gap-3">
                      <code className="break-all text-sm font-semibold text-souls-parchment">{USDT_TRC20_ADDRESS}</code>
                      <button
                        aria-label="Copy USDT address"
                        className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded border border-souls-gold/70 px-3 py-2 text-sm font-semibold text-souls-gold transition hover:bg-souls-gold hover:text-souls-void"
                        onClick={copyAddress}
                        type="button"
                      >
                        {isAddressCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        {isAddressCopied ? "Copied" : "Copy address"}
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-souls-panel/65">Please send USDT only via the TRC20 network.</p>
                  </div>
                  {qrCodeUrl ? (
                    <figure className="shrink-0 self-center rounded bg-souls-parchment p-2 text-center">
                      <img alt="QR code for the USDT TRC20 donation address" className="size-28" src={qrCodeUrl} />
                      <figcaption className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-souls-ink">Scan to donate</figcaption>
                    </figure>
                  ) : null}
                </div>
              </section>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
