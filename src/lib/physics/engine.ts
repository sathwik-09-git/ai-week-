import { PhysicsParams, SimulationFrame } from "./types";

const DEG_TO_RAD = Math.PI / 180;

export function computeFrame(params: PhysicsParams, t: number): SimulationFrame {
  switch (params.type) {
    case "vertical_projectile":
      return verticalProjectile(params, t);
    case "horizontal_projectile":
      return horizontalProjectile(params, t);
    case "free_fall":
      return freeFall(params, t);
    case "simple_harmonic_motion":
      return shm(params, t);
    default:
      return verticalProjectile(params, t);
  }
}

function verticalProjectile(p: PhysicsParams, t: number): SimulationFrame {
  const vy = p.initialVelocity - p.gravity * t;
  const y = p.initialHeight + p.initialVelocity * t - 0.5 * p.gravity * t * t;
  return { time: t, x: 0, y: Math.max(y, 0), vx: 0, vy };
}

function horizontalProjectile(p: PhysicsParams, t: number): SimulationFrame {
  const rad = p.angle * DEG_TO_RAD;
  const vx0 = p.initialVelocity * Math.cos(rad);
  const vy0 = p.initialVelocity * Math.sin(rad);
  const x = vx0 * t;
  const y = p.initialHeight + vy0 * t - 0.5 * p.gravity * t * t;
  return { time: t, x, y: Math.max(y, 0), vx: vx0, vy: vy0 - p.gravity * t };
}

function freeFall(p: PhysicsParams, t: number): SimulationFrame {
  const y = p.initialHeight - 0.5 * p.gravity * t * t;
  const vy = -p.gravity * t;
  return { time: t, x: 0, y: Math.max(y, 0), vx: 0, vy };
}

function shm(p: PhysicsParams, t: number): SimulationFrame {
  const amp = p.amplitude ?? 0.5;
  const freq = p.frequency ?? 2;
  const omega = 2 * Math.PI * freq;
  const x = amp * Math.cos(omega * t);
  const vx = -amp * omega * Math.sin(omega * t);
  return { time: t, x, y: 0, vx, vy: 0 };
}

export function getMaxTime(params: PhysicsParams): number {
  switch (params.type) {
    case "vertical_projectile": {
      const tUp = params.initialVelocity / params.gravity;
      const tTotal = tUp + Math.sqrt(2 * (params.initialHeight + params.initialVelocity * tUp) / params.gravity);
      return Math.max(tTotal, 1) + 0.5;
    }
    case "horizontal_projectile": {
      const rad = params.angle * DEG_TO_RAD;
      const vy0 = params.initialVelocity * Math.sin(rad);
      const disc = vy0 * vy0 + 2 * params.gravity * params.initialHeight;
      const tLand = (vy0 + Math.sqrt(Math.max(disc, 0))) / params.gravity;
      return Math.max(tLand, 1) + 0.5;
    }
    case "free_fall": {
      const tLand = Math.sqrt(2 * params.initialHeight / params.gravity);
      return Math.max(tLand, 1) + 0.5;
    }
    case "simple_harmonic_motion":
      return 3 / (params.frequency ?? 2);
    default:
      return 5;
  }
}

export function generateTrajectory(params: PhysicsParams, dt: number = 0.02): SimulationFrame[] {
  const maxT = getMaxTime(params);
  const frames: SimulationFrame[] = [];
  for (let t = 0; t <= maxT; t += dt) {
    const frame = computeFrame(params, t);
    frames.push(frame);
    if (params.type !== "simple_harmonic_motion" && frame.y <= 0 && t > 0.01) break;
  }
  return frames;
}
