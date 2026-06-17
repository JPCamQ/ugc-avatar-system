import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const avatarId = searchParams.get("state");

    if (!code || !avatarId) {
      return NextResponse.json(
        { error: "Parámetros de autenticación incompletos." },
        { status: 400 }
      );
    }

    // Caso de Mock en desarrollo
    if (code === "mock_authorization_code") {
      await prisma.avatar.update({
        where: { id: avatarId },
        data: {
          instagramAccessToken: "mock_long_lived_token_123456",
          instagramUserId: "17841400000000000",
          instagramUserName: "milenareyes.ai"
        }
      });

      const redirectUrl = new URL("/dashboard/metrics", request.url);
      redirectUrl.searchParams.set("connected", "true");
      return NextResponse.redirect(redirectUrl);
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3000/api/auth/instagram/callback";

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Credenciales de Instagram API no configuradas en el servidor." },
        { status: 500 }
      );
    }

    // 1. Intercambiar code por token de acceso de corta duración
    const shortTokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&client_secret=${clientSecret}&code=${code}`
    );
    const shortTokenData = await shortTokenRes.json();
    if (!shortTokenRes.ok || shortTokenData.error) {
      throw new Error(shortTokenData.error?.message || "Fallo al obtener token de corta duración");
    }

    const shortToken = shortTokenData.access_token;

    // 2. Intercambiar por token de acceso de larga duración (60 días)
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortToken}`
    );
    const longTokenData = await longTokenRes.json();
    if (!longTokenRes.ok || longTokenData.error) {
      throw new Error(longTokenData.error?.message || "Fallo al obtener token de larga duración");
    }

    const longToken = longTokenData.access_token;

    // 3. Consultar las páginas de Facebook administradas para encontrar la cuenta de Instagram Business
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${longToken}`);
    const pagesData = await pagesRes.json();
    if (!pagesRes.ok || pagesData.error) {
      throw new Error(pagesData.error?.message || "Fallo al consultar páginas de Facebook administradas");
    }

    interface FBPage {
      id: string;
      name: string;
    }

    const pages = (pagesData.data || []) as FBPage[];
    let instagramId = "";
    let instagramName = "";

    // Buscar cuenta de Instagram Business asociada en cada página
    for (const page of pages) {
      const igRes = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${longToken}`
      );
      const igData = await igRes.json();
      if (igRes.ok && igData.instagram_business_account?.id) {
        instagramId = igData.instagram_business_account.id;
        break;
      }
    }

    if (!instagramId) {
      throw new Error(
        "No se encontró ninguna cuenta de Instagram Business vinculada a tus páginas de Facebook autorizadas."
      );
    }

    // 4. Obtener el username de Instagram de la cuenta vinculada
    const igUserRes = await fetch(
      `https://graph.facebook.com/v19.0/${instagramId}?fields=username&access_token=${longToken}`
    );
    const igUserData = await igUserRes.json();
    if (igUserRes.ok && igUserData.username) {
      instagramName = igUserData.username;
    }

    // 5. Guardar credenciales en el avatar en la base de datos
    await prisma.avatar.update({
      where: { id: avatarId },
      data: {
        instagramAccessToken: longToken,
        instagramUserId: instagramId,
        instagramUserName: instagramName || "milenareyes.ai"
      }
    });

    const redirectUrl = new URL("/dashboard/metrics", request.url);
    redirectUrl.searchParams.set("connected", "true");
    return NextResponse.redirect(redirectUrl);
  } catch (error: unknown) {
    console.error("Error en Callback de OAuth Instagram:", error);
    const message = error instanceof Error ? error.message : "Fallo al procesar el callback de autenticación";
    
    // Redirigir de vuelta con error
    const redirectUrl = new URL("/dashboard/metrics", request.url);
    redirectUrl.searchParams.set("error", encodeURIComponent(message));
    return NextResponse.redirect(redirectUrl);
  }
}
