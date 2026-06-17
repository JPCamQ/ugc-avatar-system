import { NextResponse } from "next/server";
import { generateAccountSetup } from "@/lib/deepseek";
import { AvatarIdentity } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { avatar } = body;

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader ? authHeader.replace("Bearer ", "").trim() : body.apiKey;

    if (!avatar) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: avatar." },
        { status: 400 }
      );
    }

    const setupData = await generateAccountSetup(avatar as AvatarIdentity, apiKey);
    return NextResponse.json({ setupData });
  } catch (error: any) {
    console.error("Error in /api/setup:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al generar el setup de cuenta." },
      { status: 500 }
    );
  }
}
