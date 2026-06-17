import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { avatarUpdateSchema } from "@/lib/validations/avatar";

// PUT /api/avatars/[id] - Actualizar identidad del avatar
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = avatarUpdateSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json(
        { error: `Datos de actualización inválidos: ${errorMsg}` },
        { status: 400 }
      );
    }

    // Extraemos todos los campos validados que se pueden actualizar en la identidad
    const {
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
      instagramAccessToken,
      instagramUserId,
      instagramUserName,
    } = validation.data;

    const updatedAvatar = await prisma.avatar.update({
      where: { id },
      data: {
        name,
        age: age ? Number(age) : undefined,
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
        instagramAccessToken,
        instagramUserId,
        instagramUserName,
      },
    });

    return NextResponse.json({ data: updatedAvatar });
  } catch (error: unknown) {
    console.error("Error in PUT /api/avatars/[id]:", error);
    const message = error instanceof Error ? error.message : "Error al actualizar el avatar.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/avatars/[id] - Eliminar avatar y datos asociados
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Prisma se encarga de eliminar Cascade según nuestro esquema (onDelete: Cascade)
    await prisma.avatar.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Avatar eliminado con éxito." });
  } catch (error: unknown) {
    console.error("Error in DELETE /api/avatars/[id]:", error);
    const message = error instanceof Error ? error.message : "Error al eliminar el avatar.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
