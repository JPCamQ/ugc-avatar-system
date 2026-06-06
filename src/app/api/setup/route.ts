import { NextResponse } from "next/server";
import { generateAccountSetup } from "@/lib/gemini";
import { AvatarIdentity } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { avatar, apiKey } = await request.json();

    if (!avatar || !apiKey) {
      return NextResponse.json(
        { error: "Faltan parámetros: avatar y apiKey son requeridos." },
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
