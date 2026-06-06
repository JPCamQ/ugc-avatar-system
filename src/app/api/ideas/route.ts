import { NextResponse } from "next/server";
import { generatePostIdeas } from "@/lib/gemini";
import { AvatarIdentity } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { avatar, phase, apiKey } = await request.json();

    if (!avatar || !phase || !apiKey) {
      return NextResponse.json(
        { error: "Faltan parámetros: avatar, phase y apiKey son requeridos." },
        { status: 400 }
      );
    }

    const ideas = await generatePostIdeas(avatar as AvatarIdentity, phase, apiKey);
    return NextResponse.json({ ideas });
  } catch (error: any) {
    console.error("Error in /api/ideas:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al generar ideas de posts." },
      { status: 500 }
    );
  }
}
