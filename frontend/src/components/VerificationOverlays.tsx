type FaceBoxOverlayProps = {
  active?: boolean;
};

function Corner({ className }: { className: string }) {
  return <div className={`absolute h-6 w-6 border-signal/70 ${className}`} />;
}

export function FaceBoxOverlay({ active }: FaceBoxOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative h-[62%] w-[62%] max-w-[520px] rounded-2xl border border-edge/70 bg-black/10 shadow-panel">
        <Corner className="left-3 top-3 border-l-2 border-t-2" />
        <Corner className="right-3 top-3 border-r-2 border-t-2" />
        <Corner className="left-3 bottom-3 border-b-2 border-l-2" />
        <Corner className="right-3 bottom-3 border-b-2 border-r-2" />

        <div
          className={`absolute inset-x-4 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-signal/70 to-transparent transition-opacity ${
            active ? "opacity-80" : "opacity-20"
          }`}
        />
      </div>
    </div>
  );
}

export function CameraGlyph() {
  return (
    <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-edge/70 bg-panel/60 px-3 py-2 backdrop-blur">
      <div className="text-[10px] font-mono tracking-[0.2em] text-white/65">CAM</div>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-signal shadow-neon-cyan" />
        <div className="text-[11px] font-mono text-white/60">LIVE</div>
      </div>
    </div>
  );
}
