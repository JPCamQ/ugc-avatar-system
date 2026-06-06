import { NextResponse } from "next/server";
import { generateInstagramCaption } from "@/lib/gemini";
import { AvatarIdentity, PostIdea } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { avatar, idea, apiKey } = await request.json();

    if (!avatar || !idea || !apiKey) {
      return NextResponse.json(
        { error: "Faltan parámetros: avatar, idea y apiKey son requeridos." },
        { status: 400 }
      );
    }

    const caption = await generateInstagramCaption(
      avatar as AvatarIdentity,
      idea as PostIdea,
      apiKey
    );
    return NextResponse.json({ caption });
  } catch (error: any) {
    console.error("Error in /api/caption:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al generar el pie de foto de Instagram." },
      { status: 500 }
    );
  }
}
