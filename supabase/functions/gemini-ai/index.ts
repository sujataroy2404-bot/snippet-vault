
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI } from "npm:@google/genai@0.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  const jsonHeaders = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: jsonHeaders }
      );
    }

    const { code, language } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid code" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY secret is missing in Supabase",
        }),
        { status: 503, headers: jsonHeaders }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Analyze this ${language || ""} code snippet.

Return only a valid JSON object in this format:
{"tags":["tag1","tag2","tag3"],"summary":"One concise sentence explaining the code."}

Requirements:
- Generate 3 to 5 relevant lowercase tags without #.
- The summary must be one concise sentence.
- Return only JSON, without Markdown fences.

Code snippet:
${code}`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 512,
        responseMimeType: "application/json",
      },
    });

    const text = result.text;

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Empty response from Gemini" }),
        { status: 502, headers: jsonHeaders }
      );
    }

    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed: { tags: string[]; summary: string };

    try {
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");

      if (start === -1 || end === -1 || end < start) {
        throw new Error("No JSON object found in Gemini response");
      }

      parsed = JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return new Response(
        JSON.stringify({
          error: "Could not parse Gemini response",
          detail: cleaned.slice(0, 1000),
        }),
        { status: 502, headers: jsonHeaders }
      );
    }

    if (
      !Array.isArray(parsed.tags) ||
      !parsed.tags.every((tag) => typeof tag === "string") ||
      typeof parsed.summary !== "string" ||
      !parsed.summary.trim()
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 502, headers: jsonHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        tags: parsed.tags.slice(0, 5),
        summary: parsed.summary.trim(),
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";

    console.error("Gemini AI function error:", message);

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
