import { NextResponse } from "next/server";
import { expandAvatarIdentity } from "@/lib/deepseek";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gender, niche, location, bodyType } = body;

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader ? authHeader.replace("Bearer ", "").trim() : body.apiKey;

    if (!gender || !niche || !location || !bodyType) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: gender, niche, location o bodyType." },
        { status: 400 }
      );
    }

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
