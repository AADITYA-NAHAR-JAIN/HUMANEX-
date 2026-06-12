import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseWebcamCaptureOptions = {
  intervalMs?: number;
  maxFrames?: number;
  mimeType?: "image/jpeg" | "image/png";
  jpegQuality?: number; // 0..1
};

export function useWebcamCapture(opts: UseWebcamCaptureOptions = {}) {
  const intervalMs = opts.intervalMs ?? 300;
  const maxFrames = opts.maxFrames ?? 36;
  const mimeType = opts.mimeType ?? "image/jpeg";
  const jpegQuality = opts.jpegQuality ?? 0.86;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => frames.length > 0, [frames.length]);

  const start = useCallback(async () => {
    if (timerRef.current) return;
    setError(null);
    setFrames([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 960 }, height: { ideal: 540 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      const v = videoRef.current;
      if (!v) throw new Error("video element missing");
      v.srcObject = stream;
      await v.play();

      setIsRunning(true);

      timerRef.current = window.setInterval(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.readyState < 2) return;

        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return;

        let canvas = canvasRef.current;
        if (!canvas) {
          canvas = document.createElement("canvas");
          canvasRef.current = canvas;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);

        const dataUrl = canvas.toDataURL(mimeType, mimeType === "image/jpeg" ? jpegQuality : undefined);
        setFrames((prev) => {
          const next = prev.length >= maxFrames ? prev.slice(1) : prev.slice();
          next.push(dataUrl);
          return next;
        });
      }, intervalMs);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unable to access webcam";
      setError(msg);
      setIsRunning(false);
      if (streamRef.current) {
        for (const t of streamRef.current.getTracks()) t.stop();
        streamRef.current = null;
      }
    }
  }, [intervalMs, maxFrames, mimeType, jpegQuality]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    videoRef,
    isRunning,
    frames,
    canSubmit,
    error,
    start,
    stop,
    setFrames,
  };
}
