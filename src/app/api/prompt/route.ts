import { NextResponse } from "next/server";
import { generatePromptForFlow } from "@/lib/gemini";
import { AvatarIdentity, PostIdea } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { avatar, idea, apiKey, audioLanguage } = await request.json();

    if (!avatar || !idea || !apiKey) {
      return NextResponse.json(
        { error: "Faltan parámetros: avatar, idea y apiKey son requeridos." },
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
