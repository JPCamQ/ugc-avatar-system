import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { avatarId, platform } = await request.json();

    if (!avatarId) {
      return NextResponse.json(
        { error: "El parámetro avatarId es obligatorio." },
        { status: 400 }
      );
    }

    // Buscar el avatar en la base de datos para ver si tiene token de Instagram
    const avatar = await prisma.avatar.findUnique({
      where: { id: avatarId }
    });

    if (!avatar) {
      return NextResponse.json({ error: "Avatar no encontrado." }, { status: 404 });
    }

    const hasToken = avatar.instagramAccessToken && avatar.instagramUserId;
    const isMockToken = avatar.instagramAccessToken?.startsWith("mock_");

    let followers = 48500;
    let reach = 284000;
    let dmsReceived = 3820;
    let engagement = 5.6;
    let isConnectedReal = false;
    let connectedUsername = avatar.instagramUserName || null;

    if (hasToken && !isMockToken) {
      // 1. Integración API Real con Instagram Graph API
      try {
        const token = avatar.instagramAccessToken;
        const igId = avatar.instagramUserId;

        // Consultar conteo de seguidores y media
        const userRes = await fetch(
          `https://graph.facebook.com/v19.0/${igId}?fields=followers_count,media_count,username&access_token=${token}`
        );
        const userData = await igResToJson(userRes);

        if (userData && userData.followers_count !== undefined) {
          followers = userData.followers_count;
          connectedUsername = userData.username || connectedUsername;
          isConnectedReal = true;
        }

        // Consultar insights (reach e impresiones de los últimos 30 días o diarios)
        const insightsRes = await fetch(
          `https://graph.facebook.com/v19.0/${igId}/insights?metric=impressions,reach&period=day&access_token=${token}`
        );
        const insightsData = await igResToJson(insightsRes);

        if (insightsData && Array.isArray(insightsData.data)) {
          // Obtener los datos más recientes de reach
          const reachItem = (insightsData.data as { name: string; values: { value: number | string }[] }[]).find(
            (item) => item.name === "reach"
          );
          if (reachItem && Array.isArray(reachItem.values) && reachItem.values.length > 0) {
            reach = reachItem.values.reduce((sum: number, v) => sum + (Number(v.value) || 0), 0);
          }
        }
      } catch (apiErr) {
        console.error("Fallo al conectar con Instagram Graph API, usando fallback mock:", apiErr);
      }
    }

    // Si no es real o falló, generamos una simulación basada en el hash del ID del avatar
    if (!isConnectedReal) {
      const idHash = avatarId.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      followers = 45000 + (idHash % 15000);
      reach = 240000 + (idHash % 90000);
      dmsReceived = 3200 + (idHash % 1200);
      engagement = 5.0 + ((idHash % 30) / 10);
    }

    // Generar histórico de los últimos 7 días para el gráfico SVG
    const historicalData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });

      // Generar una variación pseudo-aleatoria estable
      const seed = (followers + i * 153) % 1000;
      historicalData.push({
        date: dateStr,
        followers: Math.round(followers - i * 150 + (seed % 100)),
        reach: Math.round(reach - i * 1200 + (seed * 10)),
        engagement: +(engagement - i * 0.1 + ((seed % 5) / 10)).toFixed(1)
      });
    }

    return NextResponse.json({
      metrics: {
        followers,
        followersChange: 8.4,
        dmsReceived,
        dmsChange: 5.2,
        reach,
        reachChange: 12.8,
        engagement,
        platform: platform || "instagram",
        isConnected: !!hasToken,
        isConnectedReal,
        connectedUsername
      },
      historicalData
    });
  } catch (error: unknown) {
    console.error("Error in /api/metrics:", error);
    const message = error instanceof Error ? error.message : "Error al comunicarse con la API de métricas.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

async function igResToJson(res: Response) {
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}
