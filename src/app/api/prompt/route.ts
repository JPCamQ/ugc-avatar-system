import { NextResponse } from "next/server";
import { generatePromptForFlow } from "@/lib/deepseek";
import { AvatarIdentity, PostIdea } from "@/lib/types";
import { promptRequestSchema } from "@/lib/validations/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = promptRequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json(
        { error: `Datos de prompt inválidos: ${errorMsg}` },
        { status: 400 }
      );
    }

    const { avatar, idea, audioLanguage } = validation.data;

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader ? authHeader.replace("Bearer ", "").trim() : (body.apiKey as string | undefined);

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
