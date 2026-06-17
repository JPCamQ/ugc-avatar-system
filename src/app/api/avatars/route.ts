import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { avatarIdentitySchema } from "@/lib/validations/avatar";

// GET /api/avatars - Obtener todos los avatares
export async function GET() {
  try {
    // Migración en caliente: Asegurar que el avatar por defecto en la DB tenga la instrucción de consistencia visual ultra-estricta
    const milena = await prisma.avatar.findUnique({
      where: { id: "milena_reyes" },
    });

    const targetDnaInstruction = "Every facial feature, skin texture, freckles (if applicable), pores, eye color, lip shape, hair strands, and makeup must remain 1000% identical and consistent.";
    if (milena && !milena.characterDna.includes(targetDnaInstruction)) {
      const baseDna = milena.characterDna.split(" Use the provided image")[0].trim();
      const updatedDna = `${baseDna} Use the provided image as an exact reference for identity and details. Every facial feature, skin texture, freckles (if applicable), pores, eye color, lip shape, hair strands, and makeup must remain 1000% identical and consistent. DO NOT alter their identity, proportions, skin tone, or level of realism. Generate a new, ultra-realistic image as if it were captured two seconds after this exact moment.`;
      
      await prisma.avatar.update({
        where: { id: "milena_reyes" },
        data: { characterDna: updatedDna },
      });
    }

    const avatars = await prisma.avatar.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ 
      data: avatars,
      hasGlobalApiKey: !!process.env.DEEPSEEK_API_KEY 
    });
  } catch (error: any) {
    console.error("Error in GET /api/avatars:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener la lista de avatares." },
      { status: 500 }
    );
  }
}

// POST /api/avatars - Crear un nuevo avatar
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = avatarIdentitySchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json(
        { error: `Datos de avatar inválidos: ${errorMsg}` },
        { status: 400 }
      );
    }

    const {
      id,
      name,
      age,
      niche,
      location,
      backstory,
      monetizationLink,
      monetizationProduct,
      toneOfVoice,
      language,
      characterDna,
      audioSettings,
      videoSettings,
      avatarImage,
      gender,
      bodyType,
    } = validation.data;

    const newAvatar = await prisma.avatar.create({
      data: {
        id,
        name,
        age: Number(age) || 26,
        niche,
        location,
        backstory,
        monetizationLink,
        monetizationProduct,
        toneOfVoice,
        language,
        characterDna,
        audioSettings,
        videoSettings,
        avatarImage,
        gender,
        bodyType,
      },
    });

    return NextResponse.json({ data: newAvatar });
  } catch (error: any) {
    console.error("Error in POST /api/avatars:", error);
    return NextResponse.json(
      { error: error.message || "Error al guardar el nuevo avatar." },
      { status: 500 }
    );
  }
}
