import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await request.json();

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name: payload.name,
        email: payload.email,
        whatsapp: payload.whatsapp,
        country: payload.country,
        plan: payload.plan,
        startDate: payload.startDate,
        billingDay: payload.billingDay !== undefined ? Number(payload.billingDay) : undefined,
        setupPaid: payload.setupPaid !== undefined ? Boolean(payload.setupPaid) : undefined,
        avatarName: payload.avatarName,
        niche: payload.niche,
        notes: payload.notes,
        status: payload.status
      }
    });

    return NextResponse.json({ data: updatedClient });
  } catch (error: unknown) {
    console.error("Error al actualizar cliente:", error);
    const message = error instanceof Error ? error.message : "Fallo al actualizar cliente";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.client.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error al eliminar cliente:", error);
    const message = error instanceof Error ? error.message : "Fallo al eliminar cliente";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
