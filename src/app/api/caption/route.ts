import { NextResponse } from "next/server";
import { generateInstagramCaption } from "@/lib/deepseek";
import { AvatarIdentity, PostIdea } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { avatar, idea } = body;

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader ? authHeader.replace("Bearer ", "").trim() : body.apiKey;

    if (!avatar || !idea) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: avatar e idea." },
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
