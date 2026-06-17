import { NextResponse } from "next/server";
import { generateInstagramCaption } from "@/lib/deepseek";
import { AvatarIdentity, PostIdea } from "@/lib/types";
import { captionRequestSchema } from "@/lib/validations/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = captionRequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json(
        { error: `Datos de petición inválidos: ${errorMsg}` },
        { status: 400 }
      );
    }

    const { avatar, idea } = validation.data;

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader ? authHeader.replace("Bearer ", "").trim() : (body.apiKey as string | undefined);

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
