import { useEffect, useMemo, useRef, useState } from "react";

type Telemetry = {
  movementCount: number;
  motionEnergy: number;
};

export function useMotionTelemetry(videoEl: HTMLVideoElement | null, isRunning: boolean): Telemetry {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevRef = useRef<ImageData | null>(null);
  const coolRef = useRef(0);

  const [movementCount, setMovementCount] = useState(0);
  const [motionEnergy, setMotionEnergy] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    if (!videoEl) return;

    let raf = 0;
    const tick = () => {
      raf = window.requestAnimationFrame(tick);

      if (videoEl.readyState < 2) return;
      const w = videoEl.videoWidth;
      const h = videoEl.videoHeight;
      if (!w || !h) return;

      const size = 96;
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvasRef.current = canvas;
      }
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(videoEl, 0, 0, size, size);
      const cur = ctx.getImageData(0, 0, size, size);

      const prev = prevRef.current;
      prevRef.current = cur;
      if (!prev) return;

      let sum = 0;
      const n = cur.data.length;
      for (let i = 0; i < n; i += 4) {
        const g1 = (cur.data[i] + cur.data[i + 1] + cur.data[i + 2]) / 3;
        const g0 = (prev.data[i] + prev.data[i + 1] + prev.data[i + 2]) / 3;
        sum += Math.abs(g1 - g0);
      }
      const energy = sum / (size * size);
      setMotionEnergy(energy);

      const threshold = 12.0;
      if (coolRef.current > 0) coolRef.current -= 1;
      if (energy > threshold && coolRef.current === 0) {
        setMovementCount((c) => c + 1);
        coolRef.current = 10;
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      prevRef.current = null;
      coolRef.current = 0;
      setMotionEnergy(0);
      setMovementCount(0);
    };
  }, [videoEl, isRunning]);

  return useMemo(() => ({ movementCount, motionEnergy }), [movementCount, motionEnergy]);
}
