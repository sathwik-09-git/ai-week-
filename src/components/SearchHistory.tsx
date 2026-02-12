import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Trash2 } from "lucide-react";

interface HistoryItem {
  id: string;
  problem_text: string;
  parsed_type: string | null;
  created_at: string;
}

interface Props {
  onSelect: (text: string) => void;
  refreshKey: number;
}

export default function SearchHistory({ onSelect, refreshKey }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("search_history")
      .select("id, problem_text, parsed_type, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data as HistoryItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshKey]);

  const deleteItem = async (id: string) => {
    await supabase.from("search_history").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading || items.length === 0) return null;

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
          <History className="h-4 w-4" /> Search History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 max-h-[200px] overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 group"
          >
            <button
              onClick={() => onSelect(item.problem_text)}
              className="flex-1 text-left text-xs py-1.5 px-2 rounded hover:bg-accent hover:text-accent-foreground transition-colors truncate"
            >
              <span className="font-medium">{item.problem_text}</span>
              {item.parsed_type && (
                <span className="ml-2 text-muted-foreground">({item.parsed_type.replace(/_/g, " ")})</span>
              )}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteItem(item.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
