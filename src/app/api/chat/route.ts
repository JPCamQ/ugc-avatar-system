import { NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/deepseek";
import { AvatarIdentity, ChatMessage } from "@/lib/types";
import { chatRequestSchema } from "@/lib/validations/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = chatRequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json(
        { error: `Datos de chat inválidos: ${errorMsg}` },
        { status: 400 }
      );
    }

    const { avatar, messages } = validation.data;

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader ? authHeader.replace("Bearer ", "").trim() : (body.apiKey as string | undefined);

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
