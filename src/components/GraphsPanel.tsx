import { SimulationFrame } from "@/lib/physics/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

interface Props {
  history: SimulationFrame[];
  motionType?: string;
}

const chartConfig = {
  y: { label: "Height", color: "hsl(var(--chart-1))" },
  vy: { label: "Velocity Y", color: "hsl(var(--chart-2))" },
  vx: { label: "Velocity X", color: "hsl(var(--chart-3))" },
  x: { label: "Position X", color: "hsl(var(--chart-3))" },
  speed: { label: "Speed", color: "hsl(var(--chart-4))" },
};

export default function GraphsPanel({ history, motionType }: Props) {
  const data = history.filter((_, i) => i % 3 === 0).map((f) => ({
    t: +f.time.toFixed(2),
    y: +f.y.toFixed(3),
    vy: +f.vy.toFixed(3),
    x: +f.x.toFixed(3),
    vx: +f.vx.toFixed(3),
    speed: +Math.sqrt(f.vx * f.vx + f.vy * f.vy).toFixed(3),
  }));

  const isSHM = motionType === "simple_harmonic_motion";
  const isHorizontal = motionType === "horizontal_projectile";

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Position vs Time</p>
        <ChartContainer config={chartConfig} className="h-[140px] w-full">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: "t (s)", position: "bottom", fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {isSHM ? (
              <Line type="monotone" dataKey="x" stroke="hsl(var(--chart-3))" dot={false} strokeWidth={2} name="X (m)" />
            ) : (
              <>
                <Line type="monotone" dataKey="y" stroke="hsl(var(--chart-1))" dot={false} strokeWidth={2} name="Height (m)" />
                {isHorizontal && (
                  <Line type="monotone" dataKey="x" stroke="hsl(var(--chart-3))" dot={false} strokeWidth={2} name="X (m)" />
                )}
              </>
            )}
          </LineChart>
        </ChartContainer>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Velocity vs Time</p>
        <ChartContainer config={chartConfig} className="h-[140px] w-full">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: "t (s)", position: "bottom", fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {isSHM ? (
              <Line type="monotone" dataKey="vx" stroke="hsl(var(--chart-3))" dot={false} strokeWidth={2} name="Vx (m/s)" />
            ) : isHorizontal ? (
              <>
                <Line type="monotone" dataKey="vy" stroke="hsl(var(--chart-2))" dot={false} strokeWidth={2} name="Vy (m/s)" />
                <Line type="monotone" dataKey="vx" stroke="hsl(var(--chart-3))" dot={false} strokeWidth={2} name="Vx (m/s)" />
                <Line type="monotone" dataKey="speed" stroke="hsl(var(--chart-4))" dot={false} strokeWidth={2} name="Speed (m/s)" />
              </>
            ) : (
              <Line type="monotone" dataKey="vy" stroke="hsl(var(--chart-2))" dot={false} strokeWidth={2} name="Vy (m/s)" />
            )}
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
