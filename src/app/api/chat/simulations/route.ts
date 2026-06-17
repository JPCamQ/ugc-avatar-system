import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";

// GET /api/chat/simulations - Listar simulaciones de chat para un avatar
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

    const simulations = await prisma.chatSimulation.findMany({
      where: { avatarId },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: simulations });
  } catch (error: any) {
    console.error("Error in GET /api/chat/simulations:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener las simulaciones de chat." },
      { status: 500 }
    );
  }
}

// POST /api/chat/simulations - Crear simulación o insertar mensaje
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // A. Crear una nueva simulación de chat
    if (action === "create") {
      const { simulation } = body;
      if (!simulation || !simulation.avatarId || !simulation.userName) {
        return NextResponse.json(
          { error: "Faltan parámetros requeridos para crear la simulación (avatarId, userName)." },
          { status: 400 }
        );
      }

      const newSim = await prisma.chatSimulation.create({
        data: {
          id: simulation.id || `sim_${generateId()}`,
          avatarId: simulation.avatarId,
          userName: simulation.userName,
          userBio: simulation.userBio || "",
          status: simulation.status || "active",
          notes: simulation.notes || "",
        },
        include: {
          messages: true,
        },
      });

      return NextResponse.json({ data: newSim });
    }

    // B. Insertar un nuevo mensaje en una simulación existente
    if (action === "message") {
      const { message, simulationId } = body;
      if (!message || !simulationId || !message.sender || !message.text) {
        return NextResponse.json(
          { error: "Faltan parámetros requeridos para insertar el mensaje (simulationId, sender, text)." },
          { status: 400 }
        );
      }

      const newMessage = await prisma.chatMessage.create({
        data: {
          id: message.id || `msg_${generateId()}`,
          simulationId,
          sender: message.sender,
          text: message.text,
          timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
        },
      });

      return NextResponse.json({ data: newMessage });
    }

    return NextResponse.json(
      { error: "Acción no válida. Se esperaba 'create' o 'message'." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/chat/simulations:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar la simulación o mensaje." },
      { status: 500 }
    );
  }
}

// PUT /api/chat/simulations - Actualizar simulación (status y/o notes)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID de la simulación a actualizar." },
        { status: 400 }
      );
    }

    const updatedSim = await prisma.chatSimulation.update({
      where: { id },
      data: {
        status,
        notes,
      },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    return NextResponse.json({ data: updatedSim });
  } catch (error: any) {
    console.error("Error in PUT /api/chat/simulations:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar la simulación de chat." },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/simulations - Eliminar una simulación de chat
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Falta el parámetro requerido: id de la simulación." },
        { status: 400 }
      );
    }

    await prisma.chatSimulation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Simulación de chat eliminada." });
  } catch (error: any) {
    console.error("Error in DELETE /api/chat/simulations:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar la simulación." },
      { status: 500 }
    );
  }
}
