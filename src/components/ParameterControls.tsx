import { PhysicsParams } from "@/lib/physics/types";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  params: PhysicsParams;
  onChange: (params: PhysicsParams) => void;
}

interface ParamDef {
  key: keyof PhysicsParams;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

function getParamDefs(type: string): ParamDef[] {
  const base: ParamDef[] = [
    { key: "gravity", label: "Gravity", min: 1, max: 20, step: 0.1, unit: "m/s²" },
  ];

  switch (type) {
    case "vertical_projectile":
      return [
        { key: "initialVelocity", label: "Initial Velocity", min: 1, max: 50, step: 0.5, unit: "m/s" },
        { key: "initialHeight", label: "Initial Height", min: 0, max: 100, step: 1, unit: "m" },
        ...base,
      ];
    case "horizontal_projectile":
      return [
        { key: "initialVelocity", label: "Launch Speed", min: 1, max: 50, step: 0.5, unit: "m/s" },
        { key: "angle", label: "Launch Angle", min: 5, max: 85, step: 1, unit: "°" },
        { key: "initialHeight", label: "Initial Height", min: 0, max: 100, step: 1, unit: "m" },
        ...base,
      ];
    case "free_fall":
      return [
        { key: "initialHeight", label: "Drop Height", min: 1, max: 200, step: 1, unit: "m" },
        ...base,
      ];
    case "simple_harmonic_motion":
      return [
        { key: "amplitude", label: "Amplitude", min: 0.1, max: 5, step: 0.1, unit: "m" },
        { key: "frequency", label: "Frequency", min: 0.1, max: 10, step: 0.1, unit: "Hz" },
      ];
    default:
      return base;
  }
}

export default function ParameterControls({ params, onChange }: Props) {
  const defs = getParamDefs(params.type);

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {defs.map((d) => {
          const val = (params[d.key] as number) ?? d.min;
          return (
            <div key={d.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">{d.label}</Label>
                <span className="text-xs font-mono text-primary font-semibold">
                  {val.toFixed(d.step < 1 ? 1 : 0)} {d.unit}
                </span>
              </div>
              <Slider
                value={[val]}
                min={d.min}
                max={d.max}
                step={d.step}
                onValueChange={([v]) => onChange({ ...params, [d.key]: v })}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
