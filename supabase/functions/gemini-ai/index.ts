import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI } from "npm:@google/genai@0.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'code' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service is not configured. GEMINI_API_KEY secret is missing." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert developer assistant. Analyze the following ${language || ""} code snippet and respond with ONLY a valid JSON object (no markdown, no code fences) in this exact format:

{
  "tags": ["tag1", "tag2", "tag3"],
  "summary": "A one-sentence plain-English description of what the code does."
}

Requirements:
- Generate 3 to 5 relevant tags (lowercase, no # prefix).
- Tags should relate to the language, framework, or concepts used.
- The summary must be a single concise sentence.
- Return ONLY the JSON object, nothing else.

Code snippet:
${code}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 256,
      },
    });

    const text = response.text;

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Empty response from AI service" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed: { tags: string[]; summary: string };
    try {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return new Response(
          JSON.stringify({ error: "Could not parse AI response" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!parsed.tags || !Array.isArray(parsed.tags) || !parsed.summary) {
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ tags: parsed.tags.slice(0, 5), summary: parsed.summary }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
