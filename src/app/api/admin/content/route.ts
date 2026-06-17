import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.contentBankItem.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ data: items });
  } catch (error: unknown) {
    console.error("Error al obtener contenido del banco:", error);
    const message = error instanceof Error ? error.message : "Fallo al obtener contenido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!payload.clientId || !payload.desc) {
      return NextResponse.json(
        { error: "Los campos cliente y descripción son obligatorios." },
        { status: 400 }
      );
    }

    const newItem = await prisma.contentBankItem.create({
      data: {
        id: payload.id ? String(payload.id) : String(Date.now()),
        clientId: String(payload.clientId),
        type: payload.type || "post",
        desc: payload.desc,
        date: payload.date || "",
        status: payload.status || "pending"
      }
    });

    return NextResponse.json({ data: newItem });
  } catch (error: unknown) {
    console.error("Error al crear contenido:", error);
    const message = error instanceof Error ? error.message : "Fallo al crear contenido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();

    if (!payload.id) {
      return NextResponse.json(
        { error: "El ID del contenido es obligatorio para actualizar." },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.contentBankItem.update({
      where: { id: String(payload.id) },
      data: {
        status: payload.status,
        type: payload.type,
        desc: payload.desc,
        date: payload.date
      }
    });

    return NextResponse.json({ data: updatedItem });
  } catch (error: unknown) {
    console.error("Error al actualizar contenido:", error);
    const message = error instanceof Error ? error.message : "Fallo al actualizar contenido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "El parámetro id es obligatorio para eliminar." },
        { status: 400 }
      );
    }

    await prisma.contentBankItem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error al eliminar contenido:", error);
    const message = error instanceof Error ? error.message : "Fallo al eliminar contenido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
