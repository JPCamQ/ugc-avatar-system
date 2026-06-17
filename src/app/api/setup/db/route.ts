import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/setup/db - Obtener setup viral de un avatar
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

    const setup = await prisma.accountSetup.findUnique({
      where: { avatarId },
    });

    if (!setup) {
      return NextResponse.json({ data: null });
    }

    // Parseamos los strings JSON de vuelta a objetos estructurados
    return NextResponse.json({
      data: {
        avatarId: setup.avatarId,
        usernames: JSON.parse(setup.usernames || "[]"),
        bios: JSON.parse(setup.bios || "[]"),
        gridPlan: JSON.parse(setup.gridPlan || "[]"),
        seoTips: JSON.parse(setup.seoTips || "[]"),
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/setup/db:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener el setup de la base de datos." },
      { status: 500 }
    );
  }
}

// POST /api/setup/db - Guardar o actualizar setup viral
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { avatarId, usernames, bios, gridPlan, seoTips } = body;

    if (!avatarId) {
      return NextResponse.json(
        { error: "Falta el parámetro requerido: avatarId." },
        { status: 400 }
      );
    }

    const usernamesStr = JSON.stringify(usernames || []);
    const biosStr = JSON.stringify(bios || []);
    const gridPlanStr = JSON.stringify(gridPlan || []);
    const seoTipsStr = JSON.stringify(seoTips || []);

    const updatedSetup = await prisma.accountSetup.upsert({
      where: { avatarId },
      update: {
        usernames: usernamesStr,
        bios: biosStr,
        gridPlan: gridPlanStr,
        seoTips: seoTipsStr,
      },
      create: {
        avatarId,
        usernames: usernamesStr,
        bios: biosStr,
        gridPlan: gridPlanStr,
        seoTips: seoTipsStr,
      },
    });

    return NextResponse.json({
      data: {
        avatarId: updatedSetup.avatarId,
        usernames: JSON.parse(updatedSetup.usernames),
        bios: JSON.parse(updatedSetup.bios),
        gridPlan: JSON.parse(updatedSetup.gridPlan),
        seoTips: JSON.parse(updatedSetup.seoTips),
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/setup/db:", error);
    return NextResponse.json(
      { error: error.message || "Error al guardar el setup viral en la base de datos." },
      { status: 500 }
    );
  }
}
