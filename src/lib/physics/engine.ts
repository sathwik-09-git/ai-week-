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
    case "inclined_plane":
      return inclinedPlane(params, t);
    case "rotational_motion":
      return rotationalMotion(params, t);
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

function inclinedPlane(p: PhysicsParams, t: number): SimulationFrame {
  const theta = (p.inclineAngle ?? 30) * DEG_TO_RAD;
  const mu = p.frictionCoefficient ?? 0;
  const aNet = p.gravity * (Math.sin(theta) - mu * Math.cos(theta));
  const v0 = p.initialVelocity;
  const s = v0 * t + 0.5 * aNet * t * t; // distance along incline
  const v = v0 + aNet * t;
  const x = s * Math.cos(theta);
  const y = p.initialHeight - s * Math.sin(theta);
  return { time: t, x, y: Math.max(y, 0), vx: v * Math.cos(theta), vy: -v * Math.sin(theta) };
}

function rotationalMotion(p: PhysicsParams, t: number): SimulationFrame {
  const r = p.radius ?? 2;
  const omega = p.angularVelocity ?? 3;
  const angle = omega * t;
  const x = r * Math.cos(angle);
  const y = r * Math.sin(angle);
  const vx = -r * omega * Math.sin(angle);
  const vy = r * omega * Math.cos(angle);
  return { time: t, x, y, vx, vy };
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
      const tLand = Math.sqrt(2 * Math.max(params.initialHeight, 1) / params.gravity);
      return Math.max(tLand, 1) + 0.5;
    }
    case "simple_harmonic_motion": {
      const freq = params.frequency ?? 2;
      return freq > 0 ? 3 / freq : 5;
    }
    case "inclined_plane": {
      const theta = (params.inclineAngle ?? 30) * DEG_TO_RAD;
      const h = params.initialHeight || 10;
      const sTotal = h / Math.sin(theta);
      const a = params.gravity * Math.sin(theta);
      const v0 = params.initialVelocity;
      if (a > 0) {
        const tEnd = (-v0 + Math.sqrt(v0 * v0 + 2 * a * sTotal)) / a;
        return Math.max(tEnd, 1) + 0.5;
      }
      return 5;
    }
    case "rotational_motion": {
      const omega = params.angularVelocity ?? 3;
      return omega > 0 ? (2 * Math.PI / omega) * 2 : 5;
    }
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
    if (params.type !== "simple_harmonic_motion" && params.type !== "rotational_motion" && frame.y <= 0 && t > 0.01) break;
  }
  return frames;
}
