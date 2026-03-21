import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { MODEL, MAX_TOKENS, SYSTEM_PROMPT } from "@/lib/config";
import { registreerGebruik } from "@/lib/usage-tracker";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { antwoord: "Ongeldig verzoek." },
      { status: 400 }
    );
  }

  const { bericht, geschiedenis } = body as Record<string, unknown>;

  if (typeof bericht !== "string" || bericht.trim().length === 0) {
    return NextResponse.json(
      { antwoord: "Bericht mag niet leeg zijn." },
      { status: 400 }
    );
  }

  const messages: ChatMessage[] = [];

  if (geschiedenis && Array.isArray(geschiedenis)) {
    for (const msg of geschiedenis) {
      messages.push({
        role: msg.rol === "user" ? "user" : "assistant",
        content: msg.tekst,
      });
    }
  }

  messages.push({ role: "user", content: bericht.trim() });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages,
    });

    const antwoord =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Token usage bijhouden
    try {
      await registreerGebruik(
        response.model,
        response.usage.input_tokens,
        response.usage.output_tokens
      );
    } catch (e) {
      console.error("Usage tracking fout:", e);
    }

    return NextResponse.json({ antwoord });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { antwoord: "Er ging iets mis met de API. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}
