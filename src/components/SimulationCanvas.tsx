import { useRef, useEffect, useCallback } from "react";
import { PhysicsParams, SimulationFrame } from "@/lib/physics/types";
import { computeFrame, generateTrajectory, getMaxTime } from "@/lib/physics/engine";

interface Props {
  params: PhysicsParams;
  isPlaying: boolean;
  timeRef: React.MutableRefObject<number>;
  onFrame: (frame: SimulationFrame) => void;
  compareParams?: PhysicsParams | null;
}

const CANVAS_W = 600;
const CANVAS_H = 400;
const PADDING = 50;

export default function SimulationCanvas({ params, isPlaying, timeRef, onFrame, compareParams }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const lastTs = useRef<number>(0);

  const getScale = useCallback((trajectory: SimulationFrame[]) => {
    let maxX = 1, minX = 0, maxY = 1;
    for (const f of trajectory) {
      if (f.x > maxX) maxX = f.x;
      if (f.x < minX) minX = f.x;
      if (Math.abs(f.y) > maxY) maxY = Math.abs(f.y);
    }
    const plotW = CANVAS_W - PADDING * 2;
    const plotH = CANVAS_H - PADDING * 2;
    const rangeX = Math.max(maxX - minX, 1);
    const scaleX = plotW / (rangeX * 1.15);
    const scaleY = plotH / (maxY * 1.15 || 1);
    return { scaleX, scaleY, maxX, maxY, minX };
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number) => {
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Use CSS custom properties for theming
    const isDark = document.documentElement.classList.contains("dark");
    const bgColor = isDark ? "hsl(220, 20%, 10%)" : "hsl(0, 0%, 100%)";
    const gridColor = isDark ? "hsl(220, 15%, 25%)" : "hsl(220, 15%, 88%)";
    const axisColor = isDark ? "hsl(220, 10%, 55%)" : "hsl(220, 10%, 50%)";
    const labelColor = isDark ? "hsl(220, 10%, 65%)" : "hsl(220, 10%, 45%)";
    const textColor = isDark ? "hsl(220, 25%, 85%)" : "hsl(220, 25%, 10%)";

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const trajectory = generateTrajectory(params);
    const compareTraj = compareParams ? generateTrajectory(compareParams) : null;
    const allFrames = [...trajectory, ...(compareTraj || [])];
    const { scaleX, scaleY, minX } = getScale(allFrames);

    const isCircular = params.type === "rotational_motion";
    const isSHM = params.type === "simple_harmonic_motion";
    const needsCenteredX = isSHM || isCircular;

    const originX = needsCenteredX ? CANVAS_W / 2 : PADDING - minX * scaleX;
    const originY = isCircular ? CANVAS_H / 2 : CANVAS_H - PADDING;

    // Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const gy = originY - (i / 5) * (CANVAS_H - PADDING * 2);
      ctx.beginPath(); ctx.moveTo(PADDING, gy); ctx.lineTo(CANVAS_W - PADDING, gy); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(PADDING, originY); ctx.lineTo(CANVAS_W - PADDING, originY); ctx.stroke();
    const axisStartX = needsCenteredX ? CANVAS_W / 2 : Math.max(originX, PADDING);
    ctx.beginPath(); ctx.moveTo(axisStartX, PADDING); ctx.lineTo(axisStartX, CANVAS_H - PADDING); ctx.stroke();

    // Labels
    ctx.fillStyle = labelColor;
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    const xLabel = isSHM ? "x (m)" : isCircular ? "x (m)" : "Distance (m)";
    const yLabel = isCircular ? "y (m)" : "Height (m)";
    ctx.fillText(xLabel, CANVAS_W / 2, CANVAS_H - 10);
    ctx.save();
    ctx.translate(15, CANVAS_H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    // Draw trajectory path
    const drawPath = (traj: SimulationFrame[], color: string, alpha: number = 1) => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      traj.forEach((f, i) => {
        const px = originX + f.x * scaleX;
        const py = originY - f.y * scaleY;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    drawPath(trajectory, "hsl(250, 80%, 60%)");
    if (compareTraj) drawPath(compareTraj, "hsl(170, 70%, 45%)", 0.6);

    // Current position
    const frame = computeFrame(params, t);
    const px = originX + frame.x * scaleX;
    const py = originY - frame.y * scaleY;

    // Glow
    const gradient = ctx.createRadialGradient(px, py, 0, px, py, 18);
    gradient.addColorStop(0, "hsla(250, 80%, 60%, 0.4)");
    gradient.addColorStop(1, "hsla(250, 80%, 60%, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2); ctx.fill();

    // Dot
    ctx.fillStyle = "hsl(250, 80%, 60%)";
    ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = isDark ? "hsl(0, 0%, 90%)" : "hsl(0, 0%, 100%)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Compare dot
    if (compareParams) {
      const cf = computeFrame(compareParams, t);
      const cpx = originX + cf.x * scaleX;
      const cpy = originY - cf.y * scaleY;
      ctx.fillStyle = "hsl(170, 70%, 45%)";
      ctx.beginPath(); ctx.arc(cpx, cpy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = isDark ? "hsl(0, 0%, 90%)" : "hsl(0, 0%, 100%)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = textColor;
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(params.label, px + 12, py - 8);

    // Time
    ctx.fillStyle = "hsl(250, 80%, 60%)";
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`t = ${t.toFixed(2)}s`, CANVAS_W - PADDING, PADDING - 10);

    onFrame(frame);
  }, [params, compareParams, getScale, onFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    const ctx = canvas.getContext("2d")!;

    const maxTime = getMaxTime(params);

    const animate = (timestamp: number) => {
      if (!lastTs.current) lastTs.current = timestamp;
      const delta = (timestamp - lastTs.current) / 1000;
      lastTs.current = timestamp;

      if (isPlaying) {
        timeRef.current += delta;
        if (params.type === "rotational_motion") {
          // Loop rotational motion
          if (timeRef.current > maxTime) timeRef.current = timeRef.current % maxTime;
        } else if (timeRef.current > maxTime) {
          timeRef.current = maxTime;
        }
      }
      draw(ctx, timeRef.current);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [params, isPlaying, draw, timeRef]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full max-w-[600px] h-auto rounded-lg border border-border bg-card shadow-sm"
      style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
    />
  );
}
