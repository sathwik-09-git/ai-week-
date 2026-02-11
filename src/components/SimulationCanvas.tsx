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
    let maxX = 1, maxY = 1;
    for (const f of trajectory) {
      if (Math.abs(f.x) > maxX) maxX = Math.abs(f.x);
      if (f.y > maxY) maxY = f.y;
    }
    const plotW = CANVAS_W - PADDING * 2;
    const plotH = CANVAS_H - PADDING * 2;
    const scaleX = params.type === "simple_harmonic_motion" || params.type === "horizontal_projectile"
      ? plotW / (maxX * 2.2 || 1)
      : 1;
    const scaleY = plotH / (maxY * 1.2 || 1);
    return { scaleX, scaleY, maxX, maxY };
  }, [params.type]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number) => {
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const trajectory = generateTrajectory(params);
    const compareTraj = compareParams ? generateTrajectory(compareParams) : null;
    const allFrames = [...trajectory, ...(compareTraj || [])];
    const { scaleX, scaleY } = getScale(allFrames);

    const originX = params.type === "simple_harmonic_motion" 
      ? CANVAS_W / 2 
      : params.type === "horizontal_projectile" 
        ? PADDING 
        : CANVAS_W / 2;
    const originY = CANVAS_H - PADDING;

    // Grid
    ctx.strokeStyle = "hsl(220, 15%, 80%)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const gy = originY - (i / 5) * (CANVAS_H - PADDING * 2);
      ctx.beginPath(); ctx.moveTo(PADDING, gy); ctx.lineTo(CANVAS_W - PADDING, gy); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "hsl(220, 10%, 50%)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(PADDING, originY); ctx.lineTo(CANVAS_W - PADDING, originY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(originX, PADDING); ctx.lineTo(originX, originY); ctx.stroke();

    // Labels
    ctx.fillStyle = "hsl(220, 10%, 45%)";
    ctx.font = "11px 'JetBrains Mono'";
    ctx.textAlign = "center";
    ctx.fillText(params.type === "simple_harmonic_motion" ? "x (m)" : "Distance (m)", CANVAS_W / 2, CANVAS_H - 10);
    ctx.save();
    ctx.translate(15, CANVAS_H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Height (m)", 0, 0);
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
    ctx.strokeStyle = "hsl(0, 0%, 100%)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Compare dot
    if (compareParams) {
      const cf = computeFrame(compareParams, t);
      const cpx = originX + cf.x * scaleX;
      const cpy = originY - cf.y * scaleY;
      ctx.fillStyle = "hsl(170, 70%, 45%)";
      ctx.beginPath(); ctx.arc(cpx, cpy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "hsl(0, 0%, 100%)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = "hsl(220, 25%, 10%)";
    ctx.font = "bold 12px Inter";
    ctx.textAlign = "left";
    ctx.fillText(params.label, px + 12, py - 8);

    // Time
    ctx.fillStyle = "hsl(250, 80%, 60%)";
    ctx.font = "bold 13px 'JetBrains Mono'";
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
        if (timeRef.current > maxTime) timeRef.current = maxTime;
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
