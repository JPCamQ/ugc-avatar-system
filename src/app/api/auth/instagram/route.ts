import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const avatarId = searchParams.get("avatarId");

    if (!avatarId) {
      return NextResponse.json(
        { error: "El parámetro avatarId es obligatorio para iniciar el flujo de autenticación." },
        { status: 400 }
      );
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID || "MOCK_CLIENT_ID";
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3000/api/auth/instagram/callback";
    const scope = "instagram_basic,instagram_manage_insights,pages_read_engagement";

    // En producción, esto redirige a Facebook OAuth. 
    // Para desarrollo, si no hay Client ID, podemos simular la redirección a una URL interna 
    // que actúe de mock interactivo y permita probar el flujo completo localmente.
    if (clientId === "MOCK_CLIENT_ID") {
      const mockCallbackUrl = `/api/auth/instagram/callback?code=mock_authorization_code&state=${avatarId}`;
      return NextResponse.redirect(new URL(mockCallbackUrl, request.url));
    }

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${avatarId}&scope=${encodeURIComponent(scope)}`;

    return NextResponse.redirect(authUrl);
  } catch (error: unknown) {
    console.error("Error en inicio de OAuth Instagram:", error);
    const message = error instanceof Error ? error.message : "Fallo al iniciar OAuth";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
