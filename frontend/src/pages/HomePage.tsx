import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-2xl border border-edge/70 bg-panel/40 p-7 shadow-panel backdrop-blur">
        <div className="inline-flex items-center gap-2 rounded-full border border-edge/70 bg-black/20 px-3 py-1 text-[11px] font-mono text-white/65">
          <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-neon-cyan" />
          real-time behavioral verification
        </div>
        <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
          <span className="text-gradient-cyber">HUMANEX</span>
          <span className="text-white/85"> console</span>
        </h1>
        <p className="mt-4 max-w-xl text-white/70">
          Detect human presence using blink patterns, head motion, temporal consistency, and a dynamic challenge window.
          Built as a production-style demo with a FastAPI backend and a WebRTC + React UI.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            to="/verify"
            className="rounded-xl bg-signal/15 px-5 py-2.5 text-sm font-semibold text-white shadow-neon-cyan ring-1 ring-signal/35 transition hover:bg-signal/20"
          >
            Start verification
          </Link>
          <div className="text-xs font-mono text-white/50">Tip: follow the challenge prompt exactly.</div>
        </div>
      </section>

      <aside className="rounded-2xl border border-edge/70 bg-panel/30 p-7 shadow-panel backdrop-blur">
        <div className="text-xs font-mono text-white/55">signals</div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-edge/70 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/85">Blink detection</div>
            <div className="mt-1 text-xs text-white/60">EAR from FaceMesh landmarks with debounce</div>
          </div>
          <div className="rounded-xl border border-edge/70 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/85">Head movement</div>
            <div className="mt-1 text-xs text-white/60">nose-to-center tracking, adaptive threshold</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
