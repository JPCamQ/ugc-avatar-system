import { NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/gemini";
import { AvatarIdentity, ChatMessage } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { avatar, messages, apiKey } = await request.json();

    if (!avatar || !messages || !apiKey) {
      return NextResponse.json(
        { error: "Faltan parámetros: avatar, messages y apiKey son requeridos." },
        { status: 400 }
      );
    }

    const reply = await generateChatResponse(
      avatar as AvatarIdentity,
      messages as ChatMessage[],
      apiKey
    );
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al generar la respuesta del chat." },
      { status: 500 }
    );
  }
}
