import { NextResponse } from "next/server";
import { generatePostIdeas } from "@/lib/deepseek";
import { AvatarIdentity } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { avatar, customContext } = body;

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader ? authHeader.replace("Bearer ", "").trim() : body.apiKey;

    if (!avatar) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: avatar." },
        { status: 400 }
      );
    }

    const ideas = await generatePostIdeas(avatar as AvatarIdentity, apiKey, customContext);
    return NextResponse.json({ ideas });
  } catch (error: any) {
    console.error("Error in /api/ideas:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al generar ideas de posts." },
      { status: 500 }
    );
  }
}
