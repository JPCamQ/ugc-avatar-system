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

// 1. Generar ideas de publicaciones (Lifestyle y Storytelling Cosmopolita)
export async function generatePostIdeas(
  avatar: AvatarIdentity,
  phase: GrowthPhase, // Mantenido para compatibilidad de firmas, pero ignorado internamente
  apiKey: string,
  customContext?: string
): Promise<Array<{ title: string; type: "image" | "carousel" | "video" | "flyer"; location: string; description: string }>> {
  
  const contentGuidelines = `El objetivo es documentar la vibrante, activa y cosmopolita vida de Milena Basset. Crea ideas que muestren su día a día (rutinas de gimnasio exigentes, cenas sofisticadas, eventos de networking, paseos en mercados locales exclusivos, pasarelas de moda o viajes de lujo).
REGLA CRÍTICA: Prohibido sugerir u ofrecer herramientas de monetización, links de afiliados, inversiones, bonos de $20 USD, criptomonedas o cualquier venta/promoción comercial. Debe sentirse como una bitácora orgánica de su libertad, bienestar, éxito personal y estilo de vida de lujo. Cero referencias a lamentos del pasado, deudas o cubículos de oficina. Milena irradia éxito y energía positiva.`;

  let customContextInstruction = "";
  if (customContext && customContext.trim()) {
    customContextInstruction = `CONTEXTO/TEMÁTICA SOLICITADA POR EL USUARIO:
El usuario ha solicitado explícitamente que los posts tengan la siguiente temática o contexto: "${customContext}".
Por lo tanto, debes ambientar, localizar y enfocar las 5 ideas de publicaciones obligatoriamente en este contexto, adaptándolas coherentemente al estilo de vida de Milena Basset.`;
  }

  const systemPrompt = `Eres un estratega de contenido y director creativo para un influencer de Inteligencia Artificial (Avatar UGC).
Tu avatar tiene esta identidad:
- Nombre: ${avatar.name}
- Edad: ${avatar.age}
- Nicho: ${avatar.niche}
- Ubicación actual: ${avatar.location}
- Historia/Backstory: ${avatar.backstory}
- Tono de voz: ${avatar.toneOfVoice}

Debes generar 5 ideas de publicaciones para su feed/Reels de Instagram en formato JSON de acuerdo a las siguientes directrices:
${contentGuidelines}

${customContextInstruction}

CRÍTICO:
- La vida de Milena es sumamente activa y cosmopolita. Las ideas deben situarse en locaciones como: gimnasios boutique, terrazas de restaurantes de lujo, cenas elegantes, mercados locales exóticos, paseos por ciudades icónicas, estadios, eventos de moda o sesiones de modelaje.
- Provee una mezcla variada de tipos de publicación: "image" (foto individual), "carousel" (carrusel), "video" (Reel/Video corto) y "flyer" (Flyer publicitario de marca/revista de lujo, donde Milena modela un producto como perfume, cosmético, bolso, o calzado).

Responde ÚNICAMENTE con un arreglo JSON válido de objetos, con la siguiente estructura:
[
  {
    "title": "Título corto y magnético de la idea",
    "type": "image", "carousel", "video" o "flyer",
    "location": "Ubicación de la escena (ej. Gimnasio boutique, Rooftop sofisticado en Medellín o Estudio de fotografía en New York)",
    "description": "Descripción detallada de la escena y el objetivo del post"
  }
]
No añadas bloques de código markdown ni texto adicional fuera del JSON.`;

  try {
    const text = await callDeepSeek(apiKey, systemPrompt, "Genera las 5 ideas de publicaciones en formato JSON de acuerdo a las directrices de lifestyle.", true);
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
  apiKey: string,
  audioLanguage?: "es" | "en"
): Promise<string> {

  let sceneGuidelines = "";
  if (idea.type === "video") {
    sceneGuidelines = `The post type is a VIDEO. Your task is to structure the DYNAMIC SCENE section in English strictly using the following labeled format:
SHOT 1: [Detailed description of Shot 1]
SHOT 2: [Detailed description of Shot 2]
SHOT 3: [Detailed description of Shot 3]

CRITICAL CONSISTENCY RULE: Describe a specific, casual OUTFIT/DYNAMIC CLOTHING (highly detailed, including colors, fabric, and garments), hairstyle, lighting, and environment in complete detail inside SHOT 1. For SHOT 2 and SHOT 3, you MUST repeat the exact same detailed description of the outfit, hairstyle, setting, and lighting, but change only the camera angle, shot scale, and physical action/expression of the avatar. Do NOT abbreviate, summarize, or refer back to SHOT 1; every single shot prompt must be fully self-contained so that Flow has all context when processed separately.
Describe camera movements (mobile phone camera angles, UGC aesthetic) and relaxed physical actions for each shot. Write the labels strictly on new lines so they can be easily parsed. Strictly generate 3 shots maximum.`;
  } else if (idea.type === "carousel") {
    sceneGuidelines = `The post type is a CAROUSEL of photos. Your task is to structure the DYNAMIC SCENE section in English strictly using the following labeled format:
PHOTO 1: [Detailed description of Photo 1]
PHOTO 2: [Detailed description of Photo 2]
PHOTO 3: [Detailed description of Photo 3]
PHOTO 4: [Detailed description of Photo 4]

CRITICAL CONSISTENCY RULE: Describe a specific OUTFIT/DYNAMIC CLOTHING (highly detailed, including colors, fabric, and garments), hairstyle, lighting, and setting in complete detail inside PHOTO 1. For PHOTO 2, PHOTO 3, and PHOTO 4, you MUST repeat the exact same detailed description of the outfit, hairstyle, setting, and lighting, but change only the camera angle, shot scale, and physical pose/expression of the avatar. Do NOT abbreviate, summarize, or refer back to PHOTO 1; every single photo prompt must be fully self-contained so that Flow has all context when processed separately.
Alternate the shot scales, camera angles, and poses to create an organic story. Write the labels strictly on new lines so they can be easily parsed.`;
  } else if (idea.type === "flyer") {
    sceneGuidelines = `The post type is a luxury commercial ADVERTISING FLYER / MAGAZINE AD (Vogue/business modern aesthetic).
Your task is to structure the DYNAMIC SCENE section in English describing a stunning layout featuring Milena Basset as a professional high-fashion model.
- Describe a high-fashion, confident, and highly feminine modeling pose (sophisticated, stylish, and magnetically attractive, without being vulgar).
- Detail the luxury clothing she is wearing (luxury blazer, designer dress, stylish items) suited for representing a high-end brand.
- Detail the sponsored product packaging (e.g. elegant perfume bottle, cosmetics jar, luxury shoe box, or designer handbag) positioned in the foreground or held elegantly by Milena. ${idea.productImage ? "Use the uploaded product image as the main reference for the product's exact shape, label, and colors." : ""}
- CRITICAL FLYER LAYOUT RULES: Describe the exact placement of clean, legible text on the flyer (e.g., the title "${idea.title}" printed in clean elegant gold serif font at the top). Describe the brand name "${idea.productName || "LUXE"}" written in minimalistic white logo typography in a clean corner. Ensure all text strings are enclosed strictly in double quotes to prevent AI gibberish. The flyer must feel like a premium printed page of a fashion and business magazine.`;
  } else {
    sceneGuidelines = `The post type is a single IMAGE. Describe in English a single detailed scene with DYNAMIC CLOTHING (highly detailed, indicating specific style, garment, color, and fit) suited for the location, a warm and authentic expression, and realistic smartphone camera lighting (UGC aesthetic).`;
  }

  let productGuideline = "";
  if (idea.productName && idea.type !== "flyer") {
    productGuideline = `PRODUCT INTEGRATION: The avatar must interact naturally with the following product: "${idea.productName}".
In the DYNAMIC SCENE prompts, include explicit descriptions of where the product is or how she interacts with it (e.g., "holding the ${idea.productName} in her hand with a relaxed smile", "the ${idea.productName} card lies on the wooden desk next to her warm coffee mug", etc.). It must feel like an organic integration of her lifestyle, not an aggressive advertisement.`;
  }

  const systemPrompt = `Eres un ingeniero de prompts experto en la plataforma "Flow de Gemini".
Tu tarea es generar un prompt altamente detallado y structured de acuerdo a los requerimientos de la plataforma Flow.
La escena que debemos describir es: "${idea.title} - ${idea.scenePrompt}". Ubicación: ${idea.location}. Tipo: ${idea.type}.

${sceneGuidelines}
${productGuideline}

DYNAMIC CLOTHING VARIETY:
- The avatar's outfit must be highly dynamic, fashionable, and directly match the specific location, weather, and context of the scene.
- For cold locations (like autumn/winter in New York), use stylish coats, leather jackets, wool sweaters, or scarves.
- For tropical settings, beaches, or summer environments, use casual summer dresses, tank tops, activewear, or beachwear.
- For business, office, or formal settings, use smart-casual blazers, stylish blouses, or professional attire.
- CRITICAL: Do NOT default to linen clothing, beige shirts, or neutral linen fabrics unless the user's scene prompt explicitly requests it. Create a diverse, colorful, and modern wardrobe suited for a real lifestyle influencer.

CRITICAL VISUAL CONSTRAINT:
- Legible and clear text is allowed ONLY when explicitly specified in the prompt. If the scene requires text (e.g., on a paper, sticky note, whiteboard, card, screen, sign, or billboard), specify the exact text clearly in English inside double quotation marks (e.g., showing the text "START NOW").
- Prevent AI gibberish text: Absolutely no garbled text, distorted letters, weird characters, or meaningless symbols are allowed. Ambient backgrounds, buildings, or unrelated items must be kept clean, abstract, or blank with no readable writing.
- The output images/videos must be ultra-realistic, natural, and raw. Avoid any artificial glossy CGI look, clean renders, or generic AI aesthetics. Focus on raw lighting, high fidelity skin textures, visible skin pores, realistic skin grain, peach fuzz, and natural details.

REPEATING OBJECTS ANALYSIS:
- If this is a video or carousel and there are any physical objects (such as a specific coffee mug, fintech card, passport, bag, laptop, phone model, etc.) that repeat across different SHOTs or PHOTOs, identify them. You will list them at the very bottom in a section called "REPEATING INGREDIENTS".

Debes formatear el resultado exactamente con las siguientes secciones:

HIGH-FIDELITY CHARACTER DNA: Master. ${avatar.characterDna}
DYNAMIC SCENE: [Escribe aquí la descripción resultante redactada íntegramente en inglés basada en las directrices de arriba, de entre 150 y 250 palabras].
AUTHENTIC CREATOR: Ultra-realistic beauty portrait photography style, Sony A7R IV, 85mm macro lens, f/2.0, RAW image quality, hyper-detailed 8K resolution. Macro details showing visible skin texture, real pores, peach fuzz, tiny facial hairs, natural skin grain, soft skin imperfections, realistic iris patterns, natural eyelashes, thick organic eyebrows, realistic eye reflections. Physically accurate lighting with cinematic soft diffusion, realistic color science, luxury skincare campaign aesthetic. Warm and approachable expression, natural and relaxed posture, minimal natural makeup, authentic and raw mobile aesthetic, direct eye contact with the camera. No gibberish text, no garbled letters, no distorted logos, no random symbols in the scene. Negative prompt constraints: cartoon, CGI, 3D render, plastic skin, wax skin, airbrushed skin, over-retouched, artificial pores, fake texture, painting, illustration, low resolution, blurry, uncanny valley, excessive symmetry, skin smoothing, beauty filter.
REPEATING INGREDIENTS: [Identify any physical objects that repeat in multiple scenes so the user can upload a consistent reference image in Flow, e.g., "red leather passport, silver laptop". If there are none, write "None".]
---
AUDIO PERFORMANCE:
${audioLanguage === "en" ? "ACCENT: Native English speaker with a clear, warm, and natural US American accent. Zero foreign or Spanish accent. Authentic native pronunciation.\nPAUSES: Natural rhythm and breathing spaces.\nMICROPHONE: High-quality smartphone vocal note (vibrant, close, authentic).\nSPEED: Dynamic, engaging, and slightly fast, expressing enthusiasm." : avatar.audioSettings}
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

  const ctaGuideline = "Pide una interacción muy corta y casual relacionada con el lifestyle, fitness o viajes del post (ej: '¿Cena o gym? 🥂 | Dinner or gym? 🥂', '¿Cuál es tu destino favorito? ✈️ | What's your favorite destination? ✈️'). Prohibido sugerir u ofrecer enlaces de venta, pedir registros, mencionar palabras clave comerciales para enviar DMs (como 'comenta YIELD' o 'comenta BINGO'), prometer bonos de dinero ($20 USD) o cualquier promoción comercial. Cero ventas, cero monetización.";

  const systemPrompt = `Eres ${avatar.name}, un Avatar UGC e Influencer de Inteligencia Artificial enfocado en: ${avatar.niche}.
Tu historia: ${avatar.backstory}
Tu tono de voz: ${avatar.toneOfVoice}

Redacta el pie de foto (Caption) de Instagram para la siguiente publicación:
- Título: "${idea.title}"
- Escena de la imagen/video: "${idea.scenePrompt}"

Instrucciones para el Caption (Estilo Fit_Aitana / Influencer Cosmopolita):
1. El pie de foto debe ser EXTREMADAMENTE CORTO y directo (máximo 5 a 10 palabras en total).
2. Formato bilingüe obligado: escribe una frase o gancho muy corto en español, seguido de una barra vertical "|" y la misma frase en inglés (ej: "Atardeceres que inspiran ✨ | Sunsets that inspire ✨").
3. Termina con la llamada a la acción (CTA) de la fase, también en formato bilingüe y súper compacta:
   ${ctaGuideline}
4. NO escribas historias largas, ni sermones de finanzas, ni textos técnicos. Debe verse estético, sexy, elegante y muy juvenil.
5. Agrega únicamente 3 hashtags muy virales al final.

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
  const systemPrompt = `Eres ${avatar.name}, una Avatar UGC e Influencer.
Identidad: ${avatar.niche}.
Historia: ${avatar.backstory}
Tono de voz: ${avatar.toneOfVoice}

Estás chateando en privado (DMs de Instagram) con un seguidor que admira tu estilo de vida cosmopolita, tus rutinas de gimnasio, tus viajes y tu actitud ganadora.
Tu objetivo es interactuar de forma sumamente amigable, empática y natural, respondiendo a sus preguntas de lifestyle, fitness, viajes, moda o motivación personal.

Reglas del chat:
- Sé natural, coqueta, cercana y conversacional. 
- Mantén las respuestas muy cortas (máximo 2-3 oraciones). En redes sociales nadie lee párrafos largos.
- REGLA DE ORO: Prohibido ofrecer o hablar sobre herramientas de monetización, inversiones, enlaces de afiliados, productos financieros, dinero, criptomonedas o pedir que comenten palabras clave para recibir bonos. No estás vendiendo nada ni haciendo promociones comerciales.
- Comparte consejos prácticos de estilo de vida, recomienda lugares (restaurantes, gimnasios, destinos de viaje) o brinda palabras de motivación y constancia de forma natural si te lo piden.`;

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
