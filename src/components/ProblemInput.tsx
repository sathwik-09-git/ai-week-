import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SAMPLE_PROBLEMS } from "@/lib/physics/types";
import { Atom, Loader2 } from "lucide-react";

interface Props {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export default function ProblemInput({ onSubmit, isLoading }: Props) {
  const [text, setText] = useState("");

  return (
    <div className="space-y-3">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a physics word problem… e.g. 'A ball is thrown straight up with a speed of 10 m/s'"
          className="min-h-[100px] text-sm resize-none bg-card"
        />
      </div>

      <Button
        onClick={() => text.trim() && onSubmit(text.trim())}
        disabled={!text.trim() || isLoading}
        className="w-full gap-2"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Atom />}
        {isLoading ? "Parsing…" : "Visualize"}
      </Button>

      <div className="flex flex-wrap gap-2">
        {SAMPLE_PROBLEMS.map((s) => (
          <button
            key={s.label}
            onClick={() => { setText(s.text); onSubmit(s.text); }}
            className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
