import { Link, NavLink, Outlet } from "react-router-dom";
import { GridBackdrop } from "./GridBackdrop";

export function Layout() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <GridBackdrop />

      <header className="relative z-10 border-b border-edge/70 bg-panel/45 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="h-3.5 w-3.5 rounded-full bg-signal shadow-neon-cyan" />
              <div className="absolute inset-0 rounded-full border border-signal/40 animate-pulse-ring" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-[0.2em] text-white/90">HUMANEX</div>
              <div className="text-[11px] font-mono text-white/50">behavioral verification</div>
            </div>
          </Link>

          <nav className="flex items-center gap-3 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 transition ${
                  isActive ? "bg-edge/60 text-white" : "text-white/70 hover:text-white"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/verify"
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 transition ${
                  isActive ? "bg-edge/60 text-white" : "text-white/70 hover:text-white"
                }`
              }
            >
              Verify
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 py-10">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-edge/60 bg-panel/30 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 text-xs text-white/55">
          <div className="font-mono">HUMANEX / demo build</div>
          <div className="font-mono">local-only processing (dev)</div>
        </div>
      </footer>
    </div>
  );
}
