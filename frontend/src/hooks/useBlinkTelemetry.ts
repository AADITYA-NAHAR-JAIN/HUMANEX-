import { useEffect, useMemo, useRef, useState } from "react";

type BlinkTelemetry = {
  blinkCount: number;
  eyeBandEnergy: number;
};

export function useBlinkTelemetry(videoEl: HTMLVideoElement | null, isRunning: boolean): BlinkTelemetry {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevRef = useRef<Float32Array | null>(null);
  const coolRef = useRef(0);

  const [blinkCount, setBlinkCount] = useState(0);
  const [eyeBandEnergy, setEyeBandEnergy] = useState(0);

  useEffect(() => {
    if (!isRunning || !videoEl) return;

    let raf = 0;
    const tick = () => {
      raf = window.requestAnimationFrame(tick);
      if (videoEl.readyState < 2) return;

      const size = 84;
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

      // Eye-band heuristic (upper-middle strip). This is not biometric-grade;
      // it's just for real-time UI telemetry to make the demo feel live.
      const y0 = Math.floor(size * 0.22);
      const y1 = Math.floor(size * 0.44);
      const x0 = Math.floor(size * 0.20);
      const x1 = Math.floor(size * 0.80);
      const w = x1 - x0;
      const h = y1 - y0;
      const img = ctx.getImageData(x0, y0, w, h).data;

      const cur = new Float32Array(w * h);
      let k = 0;
      for (let i = 0; i < img.length; i += 4) {
        cur[k++] = (img[i] + img[i + 1] + img[i + 2]) / 3;
      }

      const prev = prevRef.current;
      prevRef.current = cur;
      if (!prev) return;

      let sum = 0;
      for (let i = 0; i < cur.length; i++) sum += Math.abs(cur[i] - prev[i]);
      const energy = sum / cur.length;
      setEyeBandEnergy(energy);

      if (coolRef.current > 0) coolRef.current -= 1;
      if (energy > 8.5 && coolRef.current === 0) {
        setBlinkCount((c) => c + 1);
        coolRef.current = 10;
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      prevRef.current = null;
      coolRef.current = 0;
      setBlinkCount(0);
      setEyeBandEnergy(0);
    };
  }, [videoEl, isRunning]);

  return useMemo(() => ({ blinkCount, eyeBandEnergy }), [blinkCount, eyeBandEnergy]);
}
