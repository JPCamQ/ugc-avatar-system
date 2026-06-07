import { NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/deepseek";
import { AvatarIdentity, ChatMessage } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { avatar, messages } = body;

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader ? authHeader.replace("Bearer ", "").trim() : body.apiKey;

    if (!avatar || !messages) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: avatar y messages." },
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
