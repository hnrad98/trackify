"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#2bd576", "#f5a623", "#f5455c"] as const;

type Tick = {
  x: number;
  y: number;
  h: number;
  color: string;
  base: number;
  phase: number;
  speed: number;
};

export function TickField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio, 2);
    let width = 0,
      height = 0;
    let ticks: Tick[] = [];

    function build() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      ticks = [];
      const cols = Math.floor(width / 28);
      const rows = Math.floor(height / 44);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const roll = Math.random();
          ticks.push({
            x: (c + 0.5) * (width / cols) + (Math.random() - 0.5) * 8,
            y: (r + 0.5) * (height / rows) + (Math.random() - 0.5) * 10,
            h: 10 + Math.random() * 9,
            color:
              roll < 0.82 ? COLORS[0] : roll < 0.93 ? COLORS[1] : COLORS[2],
            base: 0.07 + Math.random() * 0.1,
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.8,
          });
        }
      }
    }

    let mouseX = -9999,
      mouseY = -9999;
    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }
    function onLeave() {
      mouseX = -9999;
      mouseY = -9999;
    }

    let raf = 0,
      t = 0;
    function draw() {
      t += 0.016;
      ctx!.clearRect(0, 0, width, height);
      for (const tick of ticks) {
        const dist = Math.hypot(tick.x - mouseX, tick.y - mouseY);
        const boost = Math.max(0, 1 - dist / 150);
        const breathe = reduced
          ? 0
          : 0.04 * Math.sin(t * tick.speed + tick.phase);
        const lift = boost * 7;
        ctx!.globalAlpha = Math.min(1, tick.base + breathe + boost * 0.85);
        ctx!.fillStyle = tick.color;
        ctx!.fillRect(tick.x, tick.y - tick.h / 2 - lift, 3, tick.h + lift * 2);
      }
      ctx!.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    }

    build();
    draw();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    const ro = new ResizeObserver(() => build());
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
