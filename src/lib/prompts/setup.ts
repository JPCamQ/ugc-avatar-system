import { AvatarIdentity } from "../types";

export function getAccountSetupPrompt(avatar: AvatarIdentity): string {
  return `Eres un estratega de crecimiento viral en redes sociales (Instagram y TikTok).
Queremos lanzar una cuenta desde cero para nuestro Avatar UGC:
- Nombre: ${avatar.name}
- Nicho: ${avatar.niche}
- Backstory: ${avatar.backstory}

Genera las pautas obligatorias de optimización de perfil en formato JSON con la siguiente estructura:
{
  "usernames": ["Arreglo con 5 propuestas de nombres de usuario virales, profesionales y limpios (sin exceso de números)"],
  "bios": ["Arreglo con 3 propuestas de Biografía de Instagram/TikTok magnética de alto engagement, usando ganchos de su historia y ganchos de CTA al final"],
  "gridPlan": ["Arreglo con 3 ideas de portadas y posts/Reels anclados iniciales para vestir el feed con autoridad"],
  "seoTips": ["Arreglo con 4 consejos de optimización SEO y algoritmos para cuentas nuevas en Instagram y TikTok"]
}

Responde ÚNICAMENTE con el JSON válido. Sin markdown, sin explicaciones externas.`;
}
