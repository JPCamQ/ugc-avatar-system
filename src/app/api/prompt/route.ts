import { NextResponse } from "next/server";
import { generatePromptForFlow } from "@/lib/deepseek";
import { AvatarIdentity, PostIdea } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { avatar, idea, audioLanguage } = body;

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader ? authHeader.replace("Bearer ", "").trim() : body.apiKey;

    if (!avatar || !idea) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: avatar e idea." },
        { status: 400 }
      );
    }

    const flowPrompt = await generatePromptForFlow(
      avatar as AvatarIdentity,
      idea as PostIdea,
      apiKey,
      audioLanguage
    );
    return NextResponse.json({ flowPrompt });
  } catch (error: any) {
    console.error("Error in /api/prompt:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al generar el prompt de Flow." },
      { status: 500 }
    );
  }
}
