import { NextResponse } from "next/server";
import { generateAgencyShowcase } from "@/lib/deepseek";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { gender } = body;
    const selectedGender = typeof gender === "string" ? gender : "Femenino";

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader ? authHeader.replace("Bearer ", "").trim() : body.apiKey;

    const showcaseData = await generateAgencyShowcase(apiKey, selectedGender);
    return NextResponse.json({ showcaseData });
  } catch (error: any) {
    console.error("Error in /api/showcase/generate:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al generar el showcase de la agencia." },
      { status: 500 }
    );
  }
}
