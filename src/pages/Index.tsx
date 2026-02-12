import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PhysicsParams, ParsedProblem, SimulationFrame, DEFAULT_PARAMS } from "@/lib/physics/types";
import { generateTrajectory } from "@/lib/physics/engine";
import SimulationCanvas from "@/components/SimulationCanvas";
import ParameterControls from "@/components/ParameterControls";
import GraphsPanel from "@/components/GraphsPanel";
import ProblemInput from "@/components/ProblemInput";
import ParsedDisplay from "@/components/ParsedDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Atom, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const [params, setParams] = useState<PhysicsParams>(DEFAULT_PARAMS);
  const [parsed, setParsed] = useState<ParsedProblem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<SimulationFrame[]>([]);
  const [whatIf, setWhatIf] = useState(false);
  const [originalParams, setOriginalParams] = useState<PhysicsParams | null>(null);
  const timeRef = useRef(0);

  const onFrame = useCallback((frame: SimulationFrame) => {
    setHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].time === frame.time) return prev;
      return [...prev, frame];
    });
  }, []);

  const handleParse = async (text: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-physics", {
        body: { problem: text },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const p = data.parsed as PhysicsParams;
      const newParams = { ...DEFAULT_PARAMS, ...p };
      setParams(newParams);
      setOriginalParams(newParams);
      setParsed({ type: p.type, parameters: newParams, description: text });
      resetSim();
      setIsPlaying(true);
    } catch (e: any) {
      toast({ title: "Parsing failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetSim = () => {
    timeRef.current = 0;
    setHistory([]);
  };

  const handleParamChange = (newParams: PhysicsParams) => {
    setParams(newParams);
    resetSim();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Atom className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">STEM AI Visualizer</h1>
          <span className="text-xs text-muted-foreground hidden sm:inline">Physics Problem Simulator</span>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-4 space-y-4">
            <ProblemInput onSubmit={handleParse} isLoading={isLoading} />
            <ParsedDisplay parsed={parsed} />
            <ParameterControls params={params} onChange={handleParamChange} />

            {/* What-If Toggle */}
            {originalParams && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card">
                <Switch checked={whatIf} onCheckedChange={setWhatIf} id="whatif" />
                <Label htmlFor="whatif" className="text-xs font-medium cursor-pointer">
                  What-If Mode (compare with original)
                </Label>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-8 space-y-4">
            {/* Simulation controls */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { resetSim(); setIsPlaying(false); }}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <span className="text-xs font-mono text-muted-foreground ml-2">
                t = {timeRef.current.toFixed(2)}s
              </span>
            </div>

            {/* Canvas */}
            <div className="flex justify-center">
              <SimulationCanvas
                params={params}
                isPlaying={isPlaying}
                timeRef={timeRef}
                onFrame={onFrame}
                compareParams={whatIf ? originalParams : null}
              />
            </div>

            {/* Graphs */}
            <GraphsPanel history={history} motionType={params.type} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
