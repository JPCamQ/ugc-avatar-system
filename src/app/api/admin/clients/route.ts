import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ data: clients });
  } catch (error: unknown) {
    console.error("Error al obtener clientes:", error);
    const message = error instanceof Error ? error.message : "Fallo al obtener clientes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!payload.name || !payload.plan) {
      return NextResponse.json(
        { error: "Los campos nombre y plan son obligatorios." },
        { status: 400 }
      );
    }

    const newClient = await prisma.client.create({
      data: {
        id: payload.id ? String(payload.id) : String(Date.now()),
        name: payload.name,
        email: payload.email || "",
        whatsapp: payload.whatsapp || "",
        country: payload.country || "",
        plan: payload.plan,
        startDate: payload.startDate || new Date().toISOString().split("T")[0],
        billingDay: Number(payload.billingDay) || 1,
        setupPaid: Boolean(payload.setupPaid),
        avatarName: payload.avatarName || "",
        niche: payload.niche || "",
        notes: payload.notes || "",
        status: payload.status || "active"
      }
    });

    return NextResponse.json({ data: newClient });
  } catch (error: unknown) {
    console.error("Error al crear cliente:", error);
    const message = error instanceof Error ? error.message : "Fallo al crear cliente";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
