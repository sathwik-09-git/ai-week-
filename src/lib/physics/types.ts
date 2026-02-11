export type PhysicsType = 
  | "vertical_projectile" 
  | "horizontal_projectile" 
  | "free_fall" 
  | "simple_harmonic_motion";

export interface PhysicsParams {
  type: PhysicsType;
  initialVelocity: number;
  angle: number; // degrees
  gravity: number;
  initialHeight: number;
  mass: number;
  label: string;
  // SHM specific
  amplitude?: number;
  frequency?: number;
}

export interface SimulationState {
  time: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isComplete: boolean;
}

export interface SimulationFrame {
  time: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface ParsedProblem {
  type: PhysicsType;
  parameters: PhysicsParams;
  description: string;
}

export const DEFAULT_PARAMS: PhysicsParams = {
  type: "vertical_projectile",
  initialVelocity: 10,
  angle: 90,
  gravity: 9.8,
  initialHeight: 0,
  mass: 1,
  label: "Ball",
};

export const SAMPLE_PROBLEMS = [
  {
    label: "Vertical Throw",
    text: "A ball is thrown straight up with a speed of 10 m/s from the ground.",
  },
  {
    label: "Free Fall",
    text: "A stone is dropped from a height of 45 meters.",
  },
  {
    label: "Projectile",
    text: "A cannonball is launched at 20 m/s at an angle of 45 degrees from the ground.",
  },
  {
    label: "SHM",
    text: "A mass on a spring oscillates with an amplitude of 0.5 meters and a frequency of 2 Hz.",
  },
];
