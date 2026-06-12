export function GridBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 cyber-grid-bg" />
      <div className="absolute inset-0 scanlines" />
      <div className="absolute -top-24 left-1/2 h-72 w-[38rem] -translate-x-1/2 rounded-full bg-signal/10 blur-3xl" />
    </div>
  );
}
