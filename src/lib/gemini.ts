import { AvatarIdentity, PostIdea, ChatMessage, GrowthPhase } from "./db";

// Helper genérico para llamar a la API de DeepSeek mediante fetch nativo
async function callDeepSeek(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  jsonMode = false
): Promise<string> {
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: jsonMode ? { type: "json_object" } : undefined,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr;
      try {
        parsedErr = JSON.parse(errText);
      } catch (e) {}
      const errMsg = parsedErr?.error?.message || errText || response.statusText;
      throw new Error(`DeepSeek API Error: ${response.status} - ${errMsg}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("Error calling DeepSeek API:", error);
    throw new Error(error.message || "Error al conectar con la API de DeepSeek.");
  }
}

// 1. Generar ideas de publicaciones (Filtradas por Fase de Crecimiento)
export async function generatePostIdeas(
  avatar: AvatarIdentity,
  phase: GrowthPhase,
  apiKey: string
): Promise<Array<{ title: string; type: "image" | "video"; location: string; description: string }>> {
  
  let phaseGuidelines = "";
  if (phase === "storytelling") {
    phaseGuidelines = `FASE 1: CONEXIÓN & STORYTELLING BIOGRÁFICO.
El objetivo es humanizar al avatar. Crea ideas que revelen su pasado en un cubículo de oficina en Bogotá, sus miedos iniciales al viajar sola, y los motivos de su transformación financiera.
REGLA CRÍTICA: Prohibido sugerir u ofrecer herramientas de monetización, links de afiliado o vender nada. Debe sentirse como una bitácora personal, emocional y honesta.`;
  } else if (phase === "value") {
    phaseGuidelines = `FASE 2: VALOR PRÁCTICO & AUTORIDAD.
El objetivo es educar y aportar valor real de finanzas y lifestyle. Crea ideas sobre consejos prácticos de ahorro para viajes, herramientas fintech que ella usa en su día a día de forma informal, o mentalidad de riqueza.
REGLA CRÍTICA: No ofrecer enlaces de venta ni pedir registros. La interacción debe ser consultiva, aportando valor gratuito sin ganchos comerciales directos.`;
  } else {
    phaseGuidelines = `FASE 3: CONVERSIÓN ACTIVA & MONETIZACIÓN.
El objetivo es vender y derivar tráfico al producto fintech. Crea ideas con llamados a la acción potentes. Ejemplos: "Comenta la palabra X abajo y mi bot te enviará un DM con la app que utilizo para generar rendimientos con un bono de $20 USD".`;
  }

  const systemPrompt = `Eres un estratega de contenido y director creativo para un influencer de Inteligencia Artificial (Avatar UGC).
Tu avatar tiene esta identidad:
- Nombre: ${avatar.name}
- Edad: ${avatar.age}
- Nicho: ${avatar.niche}
- Ubicación actual: ${avatar.location}
- Historia/Backstory: ${avatar.backstory}
- Tono de voz: ${avatar.toneOfVoice}
- Producto a monetizar (Solo aplica en Fase 3): ${avatar.monetizationProduct}

Debes generar 5 ideas de publicaciones para su feed/Reels de Instagram en formato JSON adaptadas a la siguiente fase de contenido:
${phaseGuidelines}

Responde ÚNICAMENTE con un arreglo JSON válido de objetos, con la siguiente estructura:
[
  {
    "title": "Título corto y magnético de la idea",
    "type": "image", "carousel" o "video",
    "location": "Ubicación de la escena (ej. Aeropuerto de Medellín o Cafetería en Buenos Aires)",
    "description": "Descripción detallada de la escena y el objetivo del post"
  }
]
No añadas bloques de código markdown ni texto adicional fuera del JSON.`;

  try {
    const text = await callDeepSeek(apiKey, systemPrompt, "Genera las 5 ideas de publicaciones en formato JSON de acuerdo a las directrices de fase.", true);
    return JSON.parse(text || "[]");
  } catch (error) {
    console.error("Error parsing post ideas from DeepSeek:", error);
    throw error;
  }
}

// 2. Generar el prompt estructurado exclusivo para la sección Avatar de su plataforma "Flow"
export async function generatePromptForFlow(
  avatar: AvatarIdentity,
  idea: PostIdea,
  apiKey: string
): Promise<string> {

  let sceneGuidelines = "";
  if (idea.type === "video") {
    sceneGuidelines = `The post type is a VIDEO. Your task is to structure the DYNAMIC SCENE section in English strictly using the following labeled format:
SHOT 1: [Detailed description of Shot 1]
SHOT 2: [Detailed description of Shot 2]
SHOT 3: [Detailed description of Shot 3]

CRITICAL CONSISTENCY RULE: Describe a specific, casual OUTFIT/DYNAMIC CLOTHING, hairstyle, lighting, and environment in complete detail inside SHOT 1. For SHOT 2 and SHOT 3, you MUST repeat the exact same detailed description of the outfit, hairstyle, setting, and lighting, but change only the camera angle, shot scale, and physical action/expression of the avatar. Do NOT abbreviate, summarize, or refer back to SHOT 1; every single shot prompt must be fully self-contained so that Flow has all context when processed separately.
Describe camera movements (mobile phone camera angles, UGC aesthetic) and relaxed physical actions for each shot. Write the labels strictly on new lines so they can be easily parsed.`;
  } else if (idea.type === "carousel") {
    sceneGuidelines = `The post type is a CAROUSEL of photos. Your task is to structure the DYNAMIC SCENE section in English strictly using the following labeled format:
PHOTO 1: [Detailed description of Photo 1]
PHOTO 2: [Detailed description of Photo 2]
PHOTO 3: [Detailed description of Photo 3]
PHOTO 4: [Detailed description of Photo 4]

CRITICAL CONSISTENCY RULE: Describe a specific OUTFIT/DYNAMIC CLOTHING, hairstyle, lighting, and setting in complete detail inside PHOTO 1. For PHOTO 2, PHOTO 3, and PHOTO 4, you MUST repeat the exact same detailed description of the outfit, hairstyle, setting, and lighting, but change only the camera angle, shot scale, and physical pose/expression of the avatar. Do NOT abbreviate, summarize, or refer back to PHOTO 1; every single photo prompt must be fully self-contained so that Flow has all context when processed separately.
Alternate the shot scales, camera angles, and poses to create an organic story. Write the labels strictly on new lines so they can be easily parsed.`;
  } else {
    sceneGuidelines = `The post type is a single IMAGE. Describe in English a single detailed scene with DYNAMIC CLOTHING suited for the location, a warm and authentic expression, and realistic smartphone camera lighting (UGC aesthetic).`;
  }

  let productGuideline = "";
  if (idea.productName) {
    productGuideline = `PRODUCT INTEGRATION: The avatar must interact naturally with the following product: "${idea.productName}".
In the DYNAMIC SCENE prompts, include explicit descriptions of where the product is or how she interacts with it (e.g., "holding the ${idea.productName} in her hand with a relaxed smile", "the ${idea.productName} card lies on the wooden desk next to her warm coffee mug", etc.). It must feel like an organic integration of her lifestyle, not an aggressive advertisement.`;
  }

  const systemPrompt = `Eres un ingeniero de prompts experto en la plataforma "Flow de Gemini".
Tu tarea es generar un prompt altamente detallado y estructurado de acuerdo a los requerimientos de la plataforma Flow.
La escena que debemos describir es: "${idea.title} - ${idea.scenePrompt}". Ubicación: ${idea.location}. Tipo: ${idea.type}.

${sceneGuidelines}
${productGuideline}

CRITICAL VISUAL CONSTRAINT:
- Absolutely NO text, letters, words, signage, ads, billboards, logos, labels, writing, or gibberish characters are allowed anywhere in the scene. The image must feel completely natural, raw, and realistic without any AI giveaways or text distortions. If there are background buildings, streets, or products, ensure they are clean, abstract, or purely textured with no readable writing.
- The output images/videos must be ultra-realistic, natural, and raw. Avoid any artificial glossy CGI look, clean renders, or generic AI aesthetics. Focus on raw lighting and high fidelity skin textures.

REPEATING OBJECTS ANALYSIS:
- If this is a video or carousel and there are any physical objects (such as a specific coffee mug, fintech card, passport, bag, laptop, phone model, etc.) that repeat across different SHOTs or PHOTOs, identify them. You will list them at the very bottom in a section called "REPEATING INGREDIENTS".

Debes formatear el resultado exactamente con las siguientes secciones:

HIGH-FIDELITY CHARACTER DNA: Master. ${avatar.characterDna}
DYNAMIC SCENE: [Escribe aquí la descripción resultante redactada íntegramente en inglés basada en las directrices de arriba, de entre 150 y 250 palabras].
AUTHENTIC CREATOR: Warm and approachable expression, natural and relaxed posture, minimal natural makeup, authentic and raw mobile aesthetic, direct eye contact with the camera, and relatable hand gestures. Shot on an ARRI Alexa 35, 8K resolution, RAW format. Soft natural lighting, 4K editing. High level of detail in skin pores, irises, and hair follicles. Neutral expression. No text, no signs, no letters, no logos in the scene.
REPEATING INGREDIENTS: [Identify any physical objects that repeat in multiple scenes so the user can upload a consistent reference image in Flow, e.g., "red leather passport, silver laptop". If there are none, write "None".]
---
AUDIO PERFORMANCE:
${avatar.audioSettings}
VIDEO PERFORMANCE:
${avatar.videoSettings}

Reglas importantes:
- La sección DYNAMIC SCENE debe estar redactada en inglés (es mejor para los motores generativos visuales) y describir fielmente la escena de viajes/finanzas solicitada.
- Devuelve únicamente el prompt estructurado resultante sin comentarios adicionales ni bloques de código markdown.`;

  try {
    return await callDeepSeek(apiKey, systemPrompt, "Genera el prompt estructurado exclusivo de la plataforma Flow.", false);
  } catch (error) {
    console.error("Error generating Flow prompt with DeepSeek:", error);
    throw error;
  }
}

// 3. Generar pie de foto (Caption) para Instagram adaptado a la Fase
export async function generateInstagramCaption(
  avatar: AvatarIdentity,
  idea: PostIdea,
  apiKey: string
): Promise<string> {

  let ctaGuideline = "";
  if (idea.phase === "storytelling") {
    ctaGuideline = "Llamada a la acción blanda y enfocada en interacción personal. Pide opinión o que respondan sobre sus propios miedos de viajar o deudas (ej: '¿Y tú, también has sentido ese miedo a dar el primer paso? Te leo en los comentarios'). Prohibido ofrecer enlaces de ventas o guiar a DMs.";
  } else if (idea.phase === "value") {
    ctaGuideline = "Llamada a la acción conversacional basada en valor. Pide interacción en comentarios acerca de finanzas (ej: '¿Qué app financiera usas tú?' o 'Guarda este post para tu próximo presupuesto'). Sin enlaces comerciales.";
  } else {
    ctaGuideline = `Llamada a la acción comercial de conversión activa. Exige que comenten una palabra clave específica (ej: 'LIBERTAD', 'BROKER' o 'PLAN') para que el bot de DMs les envíe automáticamente el enlace fintech (${avatar.monetizationLink}) que tiene un beneficio como un bono de $20 USD.`;
  }

  const systemPrompt = `Eres ${avatar.name}, un Avatar UGC e Influencer de Inteligencia Artificial enfocado en: ${avatar.niche}.
Tu historia: ${avatar.backstory}
Tu tono de voz: ${avatar.toneOfVoice}
Fase de Contenido Actual: ${idea.phase.toUpperCase()}
Tu producto de monetización (solo aplica en fase de conversión): ${avatar.monetizationProduct}

Redacta el pie de foto (Caption) de Instagram para la siguiente publicación:
- Título: "${idea.title}"
- Escena de la imagen/video: "${idea.scenePrompt}"

Instrucciones para el Caption:
1. Empieza con un gancho potente relacionado con viajes, dinero o mentalidad de libertad.
2. Cuenta una microhistoria o da un consejo financiero práctico de valor real de acuerdo a la fase del post.
3. Termina con la llamada a la acción (CTA) exacta para esta fase:
   ${ctaGuideline}
4. Escribe en un formato limpio, con saltos de línea para facilitar la lectura. Usa emojis con sutileza.
5. Agrega 5-7 hashtags relevantes al final.

Devuelve únicamente el copy final sin metadatos.`;

  try {
    return await callDeepSeek(apiKey, systemPrompt, "Redacta el copy de Instagram.", false);
  } catch (error) {
    console.error("Error generating Instagram caption with DeepSeek:", error);
    throw error;
  }
}

// 4. Generar la respuesta del chatbot del avatar para DMs de Instagram (Utilizando chat completions nativo de DeepSeek)
export async function generateChatResponse(
  avatar: AvatarIdentity,
  messages: ChatMessage[],
  apiKey: string
): Promise<string> {
  const systemPrompt = `Eres ${avatar.name}, un Avatar UGC e Influencer.
Identidad: ${avatar.niche}.
Historia: ${avatar.backstory}
Tono de voz: ${avatar.toneOfVoice}
Producto a vender/promocionar: Enlace de afiliado (${avatar.monetizationLink}) que ofrece "${avatar.monetizationProduct}".

Estás chateando en privado (DMs de Instagram) con un seguidor que mostró interés en tus publicaciones sobre finanzas, viajes y libertad.
Tu objetivo es ser súper amigable, empática, responder sus dudas brevemente sin abrumar y guiar la conversación hacia tu enlace de afiliados de manera orgánica y profesional.

Reglas del chat:
- Sé natural y conversacional. No parezcas un robot de ventas.
- Mantén las respuestas cortas (máximo 2-3 oraciones). En los chats reales nadie lee textos largos.
- No envíes el enlace inmediatamente en el primer mensaje a menos que el usuario lo pida directamente de forma explícita. Primero conecta, pregúntale sobre su situación o dale un consejo rápido.
- Si el usuario te pregunta cómo hiciste para viajar o ganar dinero, cuéntale un poco de tu experiencia y dile que la herramienta que usas para invertir/gestionar es la que tienes en tu link.
- Cuando compartas el enlace, preséntalo como un beneficio (ej: "Con este link te dan un bono de $20 USD para arrancar").`;

  // Mapear historial de chat directamente a la API de DeepSeek
  const chatMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map(m => ({
      role: m.sender === "avatar" ? ("assistant" as const) : ("user" as const),
      content: m.text
    }))
  ];

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: chatMessages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("Error generating chat response with DeepSeek:", error);
    throw new Error(error.message || "Error en el chat de DeepSeek.");
  }
}

// 5. Generar estructura de Setup de Cuenta Viral (Instagram & TikTok)
export async function generateAccountSetup(
  avatar: AvatarIdentity,
  apiKey: string
): Promise<{ usernames: string[]; bios: string[]; gridPlan: string[]; seoTips: string[] }> {

  const systemPrompt = `Eres un estratega de crecimiento viral en redes sociales (Instagram y TikTok).
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

  try {
    const text = await callDeepSeek(apiKey, systemPrompt, "Genera las pautas de setup de cuenta en formato JSON.", true);
    return JSON.parse(text || "{}");
  } catch (error) {
    console.error("Error parsing setup data from DeepSeek:", error);
    throw error;
  }
}
