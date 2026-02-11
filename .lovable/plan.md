

# 🧪 STEM AI Visualizer — Physics Problem Simulator

## Overview
An AI-powered web app that takes physics word problems in plain English, extracts parameters using AI, and generates interactive visual simulations with real-time parameter controls.

---

## Page 1: Main Interface — Problem Input & Simulation

### Problem Input Area
- Large text input where users type or paste a physics word problem (e.g., *"A ball is thrown straight up with a speed of 10 m/s"*)
- "Visualize" button that sends the problem to AI for parsing
- Sample problem buttons for quick demos (vertical throw, free fall, horizontal projectile, SHM)

### AI Parsing Display
- Shows the extracted structured data: problem type, entities, parameters
- Displayed as a clean JSON/card view so users can see what the AI understood

### Simulation Canvas
- Animated canvas showing the physics simulation (dots with labels, trajectory paths)
- Coordinate axes with labels
- Time display and play/pause/reset controls

### Real-Time Parameter Controls
- Dynamic sliders and number inputs generated based on extracted parameters (initial velocity, gravity, angle, mass, etc.)
- Changing any slider instantly restarts the simulation with new values
- "What-If" mode toggle that lets users compare original vs modified parameters side by side

### Graphs Panel
- Position vs Time graph
- Velocity vs Time graph  
- Updates in real-time as simulation runs

---

## Supported Physics Scenarios (Modular Engine)
1. **Vertical projectile motion** (ball thrown up/down)
2. **Horizontal projectile motion** (ball launched at angle)
3. **Free fall** (object dropped from height)
4. **Simple Harmonic Motion** (spring/pendulum — stretch goal)

Each scenario uses standard kinematic equations computed frame-by-frame on the client side.

---

## AI Integration (Lovable AI via Edge Function)
- Edge function receives the word problem text
- Sends it to Gemini with a structured output prompt using tool calling
- Returns JSON with: problem type, parameters (velocity, angle, gravity, height, mass), and entity labels
- The frontend uses this JSON to configure the simulation engine and controls

---

## Design & UX
- Clean, modern dark/light theme
- Split layout: input/controls on the left, simulation + graphs on the right
- Mobile-responsive (stacked layout on small screens)
- Smooth canvas animations at 60fps
- Color-coded trajectories and parameter highlights

