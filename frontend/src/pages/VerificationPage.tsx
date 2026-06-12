import { useCallback, useMemo, useState } from "react";
import { CameraGlyph, FaceBoxOverlay } from "../components/VerificationOverlays";
import { fetchChallenge, verifyBurst, type Challenge, type VerifyResult } from "../lib/api";
import { useMotionTelemetry } from "../hooks/useMotionTelemetry";
import { useWebcamCapture } from "../hooks/useWebcamCapture";
import { useBlinkTelemetry } from "../hooks/useBlinkTelemetry";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-edge/70 bg-black/20 p-3">
      <div className="text-[10px] font-mono tracking-[0.2em] text-white/50">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white/85">{value}</div>
    </div>
  );
}

export function VerificationPage() {
  const cam = useWebcamCapture({ intervalMs: 300, maxFrames: 36, mimeType: "image/jpeg", jpegQuality: 0.86 });
  const telemetry = useMotionTelemetry(cam.videoRef.current, cam.isRunning);
  const blinkTelemetry = useBlinkTelemetry(cam.videoRef.current, cam.isRunning);

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const scoreTone = useMemo(() => {
    if (!result) return "text-white/80";
    return result.status === "Human Verified" ? "text-signal" : "text-rose-300";
  }, [result]);

  const statusUi = useMemo(() => {
    if (loading) return { label: "ANALYZING", tone: "text-amber-200", ring: "ring-amber-300/40", glow: "shadow-[0_0_30px_rgba(251,191,36,0.25)]" };
    if (!result) return { label: cam.isRunning ? "SCANNING" : "IDLE", tone: "text-white/75", ring: "ring-edge/70", glow: "" };
    if (result.status === "Human Verified") {
      return { label: "HUMAN VERIFIED", tone: "text-signal", ring: "ring-signal/40", glow: "shadow-neon-cyan" };
    }
    return { label: "SUSPICIOUS", tone: "text-rose-300", ring: "ring-rose-300/40", glow: "shadow-[0_0_30px_rgba(253,164,175,0.25)]" };
  }, [loading, result, cam.isRunning]);

  const start = useCallback(async () => {
    setErr(null);
    setResult(null);
    try {
      const ch = await fetchChallenge();
      setChallenge(ch);
      await cam.start();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to start verification");
    }
  }, [cam]);

  const stop = useCallback(() => {
    cam.stop();
    setChallenge(null);
  }, [cam]);

  const verify = useCallback(async () => {
    if (!cam.frames.length) {
      setErr("No frames captured yet. Start camera and wait a moment.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const res = await verifyBurst({ frames: cam.frames, challenge_id: challenge?.id });
      setResult(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [challenge?.id, cam.frames]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
      <section className="rounded-2xl border border-edge/70 bg-panel/35 shadow-panel backdrop-blur">
        <div className="flex items-center justify-between border-b border-edge/70 px-6 py-4">
          <div>
            <div className="text-xs font-mono tracking-[0.2em] text-white/55">VERIFICATION FEED</div>
            <div className="mt-1 text-sm text-white/70">follow the prompt; timing is randomized</div>
          </div>
          <div className={`rounded-xl bg-black/30 px-3 py-1.5 text-xs font-mono tracking-[0.16em] ring-1 ${statusUi.ring} ${statusUi.glow} ${statusUi.tone}`}>
            {statusUi.label}
          </div>
          <div className="flex gap-2">
            {!cam.isRunning ? (
              <button
                onClick={start}
                className="rounded-xl bg-signal/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-signal/35 shadow-neon-cyan hover:bg-signal/20"
              >
                Start
              </button>
            ) : (
              <button
                onClick={stop}
                className="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-edge/70 hover:bg-white/10"
              >
                Stop
              </button>
            )}
            <button
              onClick={verify}
              disabled={!cam.canSubmit || loading || !challenge}
              className="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-edge/70 hover:bg-white/10 disabled:opacity-40"
            >
              {loading ? "Verifying…" : "Verify"}
            </button>
          </div>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-b-2xl bg-black">
          <video ref={cam.videoRef} className="h-full w-full object-cover opacity-95" playsInline muted />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <CameraGlyph />
          <FaceBoxOverlay active={cam.isRunning} />

          <div className="absolute bottom-4 left-4 right-4 grid gap-2 md:grid-cols-3">
            <Stat label="FRAMES BUFFERED" value={`${cam.frames.length}`} />
            <Stat label="CLIENT MOTION" value={`${telemetry.movementCount} (E=${telemetry.motionEnergy.toFixed(1)})`} />
            <Stat label="LIVE BLINKS" value={`${blinkTelemetry.blinkCount} (E=${blinkTelemetry.eyeBandEnergy.toFixed(1)})`} />
            <Stat label="CHALLENGE" value={challenge ? challenge.prompt : "Press Start"} />
            <Stat label="ENGINE" value={cam.isRunning ? "STREAM ACTIVE" : "STANDBY"} />
          </div>
        </div>
      </section>

      <aside className="grid gap-6">
        <div className="rounded-2xl border border-edge/70 bg-panel/30 p-6 shadow-panel backdrop-blur">
          <div className="text-xs font-mono tracking-[0.2em] text-white/55">PROMPT</div>
          <div className="mt-3 text-lg font-semibold text-white/85">
            {challenge?.prompt ?? "Press Start to get a challenge"}
          </div>
          <div className="mt-2 text-sm text-white/60">{challenge?.window_hint ?? "Challenge is randomized every run."}</div>
          {cam.error ? <div className="mt-3 text-sm text-rose-300">{cam.error}</div> : null}
          {err ? <div className="mt-3 text-sm text-rose-300">{err}</div> : null}
        </div>

        <div className="rounded-2xl border border-edge/70 bg-panel/30 p-6 shadow-panel backdrop-blur">
          <div className="text-xs font-mono tracking-[0.2em] text-white/55">RESULT</div>
          {!result ? (
            <div className="mt-3 text-sm text-white/60">Run verification to see the score.</div>
          ) : (
            <div className="mt-4 grid gap-3">
              <div className={`text-3xl font-semibold ${scoreTone}`}>{result.human_score}</div>
              <div className={`inline-flex w-fit items-center rounded-lg px-2.5 py-1 text-sm font-mono ring-1 ${result.status === "Human Verified" ? "text-signal ring-signal/35 bg-signal/10" : "text-rose-300 ring-rose-300/35 bg-rose-300/10"} ${loading ? "animate-pulse" : ""}`}>
                {result.status}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Stat label="BLINK COUNT" value={`${result.blink_count}`} />
                <Stat label="MOVEMENT COUNT" value={`${result.movement_count}`} />
                <Stat label="CHALLENGE PASSED" value={result.challenge_passed ? "true" : "false"} />
                <Stat label="SPOOF SUSPECTED" value={result.spoof_suspected ? "true" : "false"} />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
