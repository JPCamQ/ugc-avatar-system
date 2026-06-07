import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { platform, token, avatarId } = await request.json();

    if (!platform || !token) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: platform y token son obligatorios." },
        { status: 400 }
      );
    }

    // Aquí irían las integraciones API reales en producción:
    // Para Instagram Graph API:
    // const res = await fetch(`https://graph.facebook.com/v19.0/me?fields=followers_count,reach,engagement&access_token=${token}`);
    //
    // Para TikTok:
    // const res = await fetch(`https://open.tiktokapis.com/v2/user/info/`, { headers: { Authorization: `Bearer ${token}` } });

    console.log(`Consultando API de ${platform} para el avatar: ${avatarId} con token de longitud: ${token.length}`);

    // Mock realista de respuesta de API si el token simula ser de producción.
    // De esta manera el frontend recibe los datos estructurados en base al API.
    // Simulemos una pequeña variación basada en el token para que se note que cambia:
    const tokenHash = token.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const baseFollowers = 45000 + (tokenHash % 15000);
    const baseDms = 3500 + (tokenHash % 1000);
    const baseReach = 260000 + (tokenHash % 80000);
    const baseEngagement = 5.2 + ((tokenHash % 30) / 10);

    return NextResponse.json({
      metrics: {
        followers: baseFollowers,
        followersChange: +(8.5 + (tokenHash % 7)).toFixed(1),
        dmsReceived: baseDms,
        dmsChange: +(5.2 + (tokenHash % 5)).toFixed(1),
        reach: baseReach,
        reachChange: +(12.4 + (tokenHash % 10)).toFixed(1),
        engagement: +baseEngagement.toFixed(1),
        platform
      }
    });
  } catch (error: any) {
    console.error("Error in /api/metrics:", error);
    return NextResponse.json(
      { error: error.message || "Error al comunicarse con la API externa de redes sociales." },
      { status: 500 }
    );
  }
}
