import { NextResponse } from "next/server";
import { generatePostIdeas } from "@/lib/deepseek";
import { AvatarIdentity } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";
import { z } from "zod";
import { postIdeaSchema } from "@/lib/validations/idea";
import { avatarIdentitySchema } from "@/lib/validations/avatar";

// Esquemas de validación locales
const createManualIdeaSchema = z.object({
  action: z.literal("create"),
  idea: postIdeaSchema,
});

const generateIdeasIaSchema = z.object({
  avatar: avatarIdentitySchema,
  customContext: z.string().optional(),
});

const updateIdeaSchema = postIdeaSchema.partial().required({ id: true });

// GET /api/ideas - Obtener ideas de la base de datos para un avatar
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const avatarId = searchParams.get("avatarId");

    if (!avatarId) {
      return NextResponse.json(
        { error: "Falta el parámetro requerido: avatarId." },
        { status: 400 }
      );
    }

    const ideas = await prisma.postIdea.findMany({
      where: { avatarId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: ideas });
  } catch (error: any) {
    console.error("Error in GET /api/ideas:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener las ideas de publicaciones." },
      { status: 500 }
    );
  }
}

// POST /api/ideas - Generar ideas con IA y guardarlas en la base de datos, o crear una idea manual
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Si viene action === "create", es una creación manual
    if (body.action === "create") {
      const validation = createManualIdeaSchema.safeParse(body);
      if (!validation.success) {
        const errorMsg = validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        return NextResponse.json(
          { error: `Datos de creación de idea inválidos: ${errorMsg}` },
          { status: 400 }
        );
      }

      const { idea } = validation.data;

      const createdIdea = await prisma.postIdea.create({
        data: {
          id: idea.id || `idea_${generateId()}`,
          avatarId: idea.avatarId,
          title: idea.title,
          type: idea.type || "image",
          location: idea.location || "",
          phase: idea.phase || "storytelling",
          scenePrompt: idea.scenePrompt || "",
          formattedFlowPrompt: idea.formattedFlowPrompt || "",
          instagramCaption: idea.instagramCaption || "",
          status: idea.status || "draft",
          productImage: idea.productImage,
          productName: idea.productName,
          promptStyle: idea.promptStyle || "ugc",
        },
      });

      return NextResponse.json({ data: createdIdea });
    }

    // De lo contrario, es la generación por IA clásica
    const validation = generateIdeasIaSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json(
        { error: `Datos de generación de ideas inválidos: ${errorMsg}` },
        { status: 400 }
      );
    }

    const { avatar, customContext } = validation.data;
    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader ? authHeader.replace("Bearer ", "").trim() : (body.apiKey as string | undefined);

    // 1. Generar ideas con DeepSeek
    const generatedIdeas = await generatePostIdeas(avatar as AvatarIdentity, apiKey, customContext);

    // 2. Guardarlas en la base de datos local
    const savedIdeas = [];
    for (const idea of generatedIdeas) {
      const dbIdea = await prisma.postIdea.create({
        data: {
          id: `idea_${generateId()}`,
          avatarId: avatar.id,
          title: idea.title,
          type: idea.type || "image",
          location: idea.location || avatar.location || "",
          phase: "storytelling",
          scenePrompt: idea.description || "",
          formattedFlowPrompt: "",
          instagramCaption: "",
          status: "draft",
          productName: "",
          promptStyle: idea.type === "flyer" ? "editorial" : "ugc",
        },
      });
      savedIdeas.push(dbIdea);
    }

    // Retornamos las ideas tal y como se guardaron en la DB (con IDs e información persistida)
    return NextResponse.json({ ideas: savedIdeas });
  } catch (error: any) {
    console.error("Error in POST /api/ideas:", error);
    return NextResponse.json(
      { error: error.message || "Error al generar o guardar ideas de posts." },
      { status: 500 }
    );
  }
}

// PUT /api/ideas - Actualizar una idea existente
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validation = updateIdeaSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json(
        { error: `Datos de actualización de idea inválidos: ${errorMsg}` },
        { status: 400 }
      );
    }

    const { id, title, type, location, phase, scenePrompt, formattedFlowPrompt, instagramCaption, status, productImage, productName, promptStyle } = validation.data;

    const updatedIdea = await prisma.postIdea.update({
      where: { id },
      data: {
        title,
        type,
        location,
        phase,
        scenePrompt,
        formattedFlowPrompt,
        instagramCaption,
        status,
        productImage,
        productName,
        promptStyle,
      },
    });

    return NextResponse.json({ data: updatedIdea });
  } catch (error: any) {
    console.error("Error in PUT /api/ideas:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar la idea de post." },
      { status: 500 }
    );
  }
}

// DELETE /api/ideas - Eliminar una idea o todas las ideas de un avatar
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const avatarId = searchParams.get("avatarId");

    if (!id && !avatarId) {
      return NextResponse.json(
        { error: "Falta el parámetro requerido: id o avatarId." },
        { status: 400 }
      );
    }

    if (id) {
      await prisma.postIdea.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: "Idea eliminada con éxito." });
    } else if (avatarId) {
      await prisma.postIdea.deleteMany({
        where: { avatarId },
      });
      return NextResponse.json({ success: true, message: "Todas las ideas del avatar han sido eliminadas." });
    }
  } catch (error: any) {
    console.error("Error in DELETE /api/ideas:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar la idea o ideas de post." },
      { status: 500 }
    );
  }
}
