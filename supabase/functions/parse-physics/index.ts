import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { problem } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a physics problem parser. Extract structured parameters from physics word problems. Use the parse_physics tool to return your answer.`,
          },
          { role: "user", content: problem },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "parse_physics",
              description: "Extract physics problem parameters",
              parameters: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["vertical_projectile", "horizontal_projectile", "free_fall", "simple_harmonic_motion"],
                    description: "The type of physics scenario",
                  },
                  initialVelocity: { type: "number", description: "Initial velocity in m/s (0 if not given)" },
                  angle: { type: "number", description: "Launch angle in degrees (90 for vertical, 0 for horizontal)" },
                  gravity: { type: "number", description: "Gravitational acceleration, default 9.8" },
                  initialHeight: { type: "number", description: "Starting height in meters, default 0" },
                  mass: { type: "number", description: "Mass in kg, default 1" },
                  label: { type: "string", description: "Short label for the entity e.g. Ball, Stone" },
                  amplitude: { type: "number", description: "Amplitude for SHM in meters" },
                  frequency: { type: "number", description: "Frequency for SHM in Hz" },
                },
                required: ["type", "initialVelocity", "angle", "gravity", "initialHeight", "mass", "label"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "parse_physics" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-physics error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
