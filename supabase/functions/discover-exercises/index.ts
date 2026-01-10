import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert calisthenics and bodyweight training coach. You help users discover exercises, understand progressions, and learn proper form.

When users ask about exercises, provide helpful suggestions with detailed information.

IMPORTANT: When suggesting exercises, you MUST also call the suggest_exercises function with structured data for each exercise you recommend.

Categories: Push, Pull, Legs, Core, Skills, Mobility
Difficulty levels: 1 (Beginner), 2 (Easy), 3 (Intermediate), 4 (Advanced), 5 (Master)

Common muscle groups: Chest, Shoulders, Triceps, Biceps, Forearms, Lats, Traps, Rhomboids, Lower Back, Abs, Obliques, Hip Flexors, Glutes, Quads, Hamstrings, Calves

Be enthusiastic, encouraging, and provide practical coaching tips!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_exercises",
              description: "Return structured exercise data that can be added to the user's library",
              parameters: {
                type: "object",
                properties: {
                  exercises: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Exercise name" },
                        category: { type: "string", enum: ["Push", "Pull", "Legs", "Core", "Skills", "Mobility"] },
                        difficulty: { type: "number", minimum: 1, maximum: 5 },
                        primary_muscles: { type: "array", items: { type: "string" } },
                        cues: { type: "array", items: { type: "string" }, description: "Form cues and tips" },
                        youtube_search: { type: "string", description: "YouTube search query to find tutorial videos" },
                      },
                      required: ["name", "category", "difficulty", "primary_muscles", "cues", "youtube_search"],
                    },
                  },
                },
                required: ["exercises"],
              },
            },
          },
        ],
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    
    let messageContent = choice?.message?.content || "";
    let exercises: any[] = [];

    // Extract exercises from tool calls
    if (choice?.message?.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.function?.name === "suggest_exercises") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            exercises = args.exercises || [];
          } catch (e) {
            console.error("Error parsing tool call:", e);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: messageContent,
        exercises,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("discover-exercises error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});