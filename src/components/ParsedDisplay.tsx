import { ParsedProblem } from "@/lib/physics/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  parsed: ParsedProblem | null;
}

const typeLabels: Record<string, string> = {
  vertical_projectile: "Vertical Projectile",
  horizontal_projectile: "Projectile Motion",
  free_fall: "Free Fall",
  simple_harmonic_motion: "Simple Harmonic Motion",
};

export default function ParsedDisplay({ parsed }: Props) {
  if (!parsed) return null;

  const { parameters } = parsed;

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            AI Parsed
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {typeLabels[parsed.type] || parsed.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="text-xs font-mono bg-muted rounded-md p-3 overflow-x-auto text-foreground">
          {JSON.stringify(parameters, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
