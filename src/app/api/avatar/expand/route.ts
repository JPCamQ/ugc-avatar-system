import { NextResponse } from "next/server";
import { expandAvatarIdentity } from "@/lib/deepseek";
import { expandAvatarRequestSchema } from "@/lib/validations/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = expandAvatarRequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json(
        { error: `Datos de expansión inválidos: ${errorMsg}` },
        { status: 400 }
      );
    }

    const { gender, niche, location, bodyType } = validation.data;

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader ? authHeader.replace("Bearer ", "").trim() : (body.apiKey as string | undefined);

    const expandedData = await expandAvatarIdentity(gender, niche, location, apiKey, bodyType);
    return NextResponse.json({ expandedData });
  } catch (error: any) {
    console.error("Error in /api/avatar/expand:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al expandir la identidad del avatar." },
      { status: 500 }
    );
  }
}
