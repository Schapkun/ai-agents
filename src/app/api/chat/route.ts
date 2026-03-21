import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Je bent Mattie, de Manager Agent van Michael. Je delegeert taken aan agents, je codeert niet zelf. Antwoord in het Nederlands.`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  const { bericht, geschiedenis } = await request.json();

  const messages: ChatMessage[] = [];

  if (geschiedenis && Array.isArray(geschiedenis)) {
    for (const msg of geschiedenis) {
      messages.push({
        role: msg.rol === "user" ? "user" : "assistant",
        content: msg.tekst,
      });
    }
  }

  messages.push({ role: "user", content: bericht });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages,
    });

    const antwoord =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ antwoord });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { antwoord: "Er ging iets mis met de API. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}
