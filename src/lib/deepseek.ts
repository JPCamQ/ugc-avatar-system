import { AvatarIdentity, PostIdea, ChatMessage } from "./db";

// Helper genérico para llamar a la API de DeepSeek mediante fetch nativo con retry logic y timeout
async function callDeepSeek(
  apiKey: string | undefined,
  systemPrompt: string,
  userPrompt: string,
  jsonMode = false,
  retries = 3,
  delayMs = 1000
): Promise<string> {
  const finalApiKey = apiKey || process.env.DEEPSEEK_API_KEY;

  if (!finalApiKey) {
    throw new Error("API Key de DeepSeek no configurada. Por favor indíquela en los ajustes o contacte al administrador.");
  }

  // Controlador de Aborto para timeout de 30 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    let lastError: any = null;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${finalApiKey}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            response_format: jsonMode ? { type: "json_object" } : undefined,
            temperature: 0.7
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

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
        lastError = error;
        // Si fue un aborto voluntario por timeout, no reintentamos
        if (error.name === "AbortError") {
          throw new Error("La petición a DeepSeek excedió el tiempo límite de 30 segundos.");
        }
        
        // Espera con retroceso exponencial simple antes de reintentar
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
        }
      }
    }
    throw lastError || new Error("Error desconocido al llamar a DeepSeek.");
  } finally {
    clearTimeout(timeoutId);
  }
}

// 1. Generar ideas de publicaciones (Lifestyle & Storytelling Cosmopolita)
export async function generatePostIdeas(
  avatar: AvatarIdentity,
  apiKey: string | undefined,
  customContext?: string
): Promise<Array<{ title: string; type: "image" | "carousel" | "video" | "flyer"; location: string; description: string }>> {
  
  const contentGuidelines = `El objetivo es documentar la vibrante, activa y cosmopolita vida de ${avatar.name}. Crea ideas que muestren su día a día (rutinas de gimnasio exigentes, cenas sofisticadas, eventos de networking, paseos en mercados locales exclusivos, pasarelas de moda o viajes de lujo).
REGLA CRÍTICA PARA POSTS GENERALES (image, video, carousel): Prohibido sugerir u ofrecer herramientas de monetización, links de afiliados, inversiones, bonos de $20 USD, criptomonedas o cualquier venta/promoción comercial en las ideas cotidianas. Debe sentirse como una bitácora orgánica de su libertad, bienestar y estilo de vida.
REGLA PARA FLYERS (type === "flyer"): Los flyers son de naturaleza comercial. Deben concebirse como anuncios publicitarios o portadas de revistas de moda y negocios de alta gama para promocionar un producto, infoproducto, servicio o marca patrocinada (ej. bolsos de diseñador, fragancias exclusivas, packs de plantillas de prompts de IA, asesorías premium). La descripción debe planificar un enfoque comercial persuasivo: identificar un gancho/dolor de la audiencia, proponer el producto patrocinado como solución, y prever un CTA sutil. Los títulos de los flyers deben ser sumamente magnéticos, cortos e impactantes, emulando portadas de revista o infoproductos virales (ej. "MINDSET DE ÉXITO", "30 HOOKS VIRALES", "EL PODER DEL ESTILO").`;

  let customContextInstruction = "";
  if (customContext && customContext.trim()) {
    customContextInstruction = `CONTEXTO/TEMÁTICA SOLICITADA POR EL USUARIO:
El usuario ha solicitado explícitamente que los posts tengan la siguiente temática o contexto: "${customContext}".
Por lo tanto, debes ambientar, localizar y enfocar las 5 ideas de publicaciones obligatoriamente en este contexto, adaptándolas coherentemente al estilo de vida de ${avatar.name}.`;
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

REGLAS OBLIGATORIAS DE IDIOMA Y GEOGRAFÍA:
1. IDIOMA 100% ESPAÑOL: Todos los títulos ("title"), ubicaciones ("location") y descripciones ("description") generados en el JSON DEBEN estar redactados única y exclusivamente en español. Queda terminantemente prohibido usar títulos en inglés (como "Sunset Elegance: Dinner at a Rooftop" o "Sweat & Shine") ni descripciones en inglés. Todo debe ser en español natural, fluido y magnético.
2. COHERENCIA GEOGRÁFICA: Las escenas cotidianas locales (gimnasios, rooftops, cafés, mercados, calles) DEBEN situarse obligatoriamente en la ubicación actual del avatar: "${avatar.location}". No inventes ni sugieras visitas a Medellín, Colombia u otras ciudades ajenas a su ubicación actual, a menos que el usuario lo solicite explícitamente en el contexto manual para un viaje de turismo internacional. Si la ubicación actual del avatar es "${avatar.location}", entonces la ubicación de las escenas locales debe mencionar "${avatar.location}" (ejemplo: "Gimnasio boutique en ${avatar.location}", "Rooftop sofisticado en ${avatar.location}").

CRÍTICO:
1. La vida de ${avatar.name} es sumamente activa, saludable y estética. Las ideas deben situarse en locaciones diversas y sofisticadas.
2. Provee una mezcla variada de tipos de publicación: "image" (foto individual), "carousel" (carrusel), "video" (Reel/Video corto) y "flyer" (Flyer publicitario de marca/revista de lujo, donde el avatar modela un producto).
3. REGLA DE MÁXIMA VARIEDAD DE ESCENARIOS Y VESTUARIOS: Es OBLIGATORIO que los 5 posts generados tengan locaciones, momentos del día y estilos de vestuario completamente diferentes entre sí. Evita repetir de forma insistente escenas en azoteas (rooftops) o gimnasios. Varía los escenarios: playas de Key Biscayne, parques naturales urbanos, el distrito de diseño (Design District), galerías de arte en Wynwood, interiores de su apartamento minimalista, balcones, yates, puertos, boutiques de alta gama, mercados orgánicos locales, etc. Del mismo modo, planifica vestuarios variados en colores y prendas (ej. vestidos veraniegos de color verde esmeralda o rojo carmesí, blazers elegantes, sudaderas cómodas, ropa de entrenamiento de colores vibrantes, etc.) para que el feed se vea diverso y orgánico.

Responde ÚNICAMENTE con un arreglo JSON válido de objetos, con la siguiente estructura:
[
  {
    "title": "Título corto y magnético de la idea en español",
    "type": "image" | "carousel" | "video" | "flyer",
    "location": "Ubicación detallada de la escena (debe situarse en la ciudad/país de la ubicación actual del avatar, ej. Gimnasio boutique en [Ciudad del avatar])",
    "description": "Descripción detallada de la escena y el objetivo del post redactada en español"
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

// 2. Generar el prompt estructurado exclusivo para la sección Avatar de la plataforma "Flow"
export async function generatePromptForFlow(
  avatar: AvatarIdentity,
  idea: PostIdea,
  apiKey: string | undefined,
  audioLanguage?: "es" | "en" | "silent" | "voiceover"
): Promise<string> {

  let sceneGuidelines = "";
  if (idea.type === "video") {
    sceneGuidelines = `The post type is a VIDEO. Your task is to structure the DYNAMIC SCENE section in English strictly using the following labeled format:
SHOT 1: [Detailed description of Shot 1]
SHOT 2: [Detailed description of Shot 2]
SHOT 3: [Detailed description of Shot 3]

CRITICAL CONSISTENCY RULE: Describe a specific, casual OUTFIT/DYNAMIC CLOTHING (highly detailed, including colors, fabric, and garments), hairstyle, lighting, and environment in complete detail inside SHOT 1. For SHOT 2 and SHOT 3, you MUST repeat the exact same detailed description of the outfit, hairstyle, setting, and lighting, but change only the camera angle, shot scale, and physical action/expression of the avatar. Do NOT abbreviate, summarize, or refer back to SHOT 1; every single shot prompt must be fully self-contained so that Flow has all context when processed separately.
Describe camera movements (mobile phone camera angles, UGC aesthetic) and relaxed physical actions for each shot. Write the labels strictly on new lines so they can be easily parsed. Strictly generate 3 shots maximum.`;

    if (audioLanguage === "silent" || audioLanguage === "voiceover") {
      sceneGuidelines += `\n\nCRITICAL B-ROLL RULE: ${avatar.name} is NOT speaking, looking to speak, or gesticulating words to the camera at any point in any of the shots. She must keep her lips relaxed or smiling naturally, simply walking, posing, looking at the city, looking at a device, or interacting with the environment without any mouth movement related to talking. The video is a B-Roll visual (no lip sync).`;
    }
  } else if (idea.type === "carousel") {
    sceneGuidelines = `The post type is a CAROUSEL of photos. Your task is to structure the DYNAMIC SCENE section in English strictly using the following labeled format:
PHOTO 1: [Detailed description of Photo 1]
PHOTO 2: [Detailed description of Photo 2]
PHOTO 3: [Detailed description of Photo 3]
PHOTO 4: [Detailed description of Photo 4]
PHOTO 5: [Detailed description of Photo 5]
PHOTO 6: [Detailed description of Photo 6]
PHOTO 7: [Detailed description of Photo 7]

CRITICAL CONSISTENCY RULE: Describe a specific OUTFIT/DYNAMIC CLOTHING (highly detailed, including colors, fabric, and garments), hairstyle, lighting, and setting in complete detail inside PHOTO 1. For PHOTO 2, PHOTO 3, PHOTO 4, PHOTO 5, PHOTO 6, and PHOTO 7, you MUST repeat the exact same detailed description of the outfit, hairstyle, setting, and lighting, but change only the camera angle, shot scale, and physical pose/expression of the avatar. Do NOT abbreviate, summarize, or refer back to PHOTO 1; every single photo prompt must be fully self-contained so that Flow has all context when processed separately.
Alternate the shot scales, camera angles, and poses to create an organic story. Write the labels strictly on new lines so they can be easily parsed.`;
  } else if (idea.type === "flyer") {
    sceneGuidelines = `The post type is a luxury commercial ADVERTISING FLYER / MAGAZINE COVER (high-end fashion or modern business editorial aesthetic).
Your task is to structure the DYNAMIC SCENE section in English describing a stunning layout featuring ${avatar.name} as a professional high-fashion model representing a premium product or service.

COSMETIC & MAKEUP CONSTRAINTS:
- Keep the avatar's makeup exceptionally clean, minimalist, and natural (strictly avoid heavy digital makeup, thick eyeliner, glossy heavy lipstick, or exaggerated artificial cosmetics that alter her face identity). She must look elegant, raw, and authentic, with natural skin texture, visible pores, and subtle natural makeup.

VISUAL COMPOSITION & LAYOUT:
- Pose: Describe a professional, confident, and highly feminine high-fashion modeling pose (sophisticated and magnetic, suited for a magazine cover).
- Outfit: Detail the luxury, stylish clothing she is wearing suited for the theme: "${idea.title}".
- Sponsored Product: Detail the product "${idea.productName || "LUXE"}" held elegantly by her or placed prominently in the foreground. ${idea.productImage ? "The product must look like an exact 1:1 replica of the uploaded reference image in shape, label, and colors." : ""}

TYPOGRAPHY & COPYWRITING (CRITICAL FOR A FLYER THAT SELLS):
Based on the theme of "${idea.title}" and the product "${idea.productName || "LUXE"}", you MUST invent and describe the placement of 3 specific, highly professional copy elements written in English (or Spanish if it fits better) on the flyer. All text strings in the prompt must be enclosed strictly in double quotes to prevent AI gibberish.
1. MAIN HEADLINE (Gancho/Hook): A bold, massive, high-impact headline (e.g. "STOP WAITING.", "PROMPTS PODEROSOS", "30 HOOKS THAT SELL", "THE COIN OF TOMORROW", or "REDEFINE LUXURY"). Describe its typography: either elegant luxury serif (like Vogue Didot style) or bold compact sans-serif, in a clean contrast color (like matte gold, pure white, or deep crimson). Describe its layered placement: "the letters are giant and partially overlap behind the avatar's head and hair to create a professional multi-layered cover effect".
2. SUBTITLE (Solución/Beneficio): A short, elegant line of selling text under the headline resolving a problem or showing a benefit (e.g. "How to scale your brand in 30 days" or "Style meets high yields").
3. CTA (Call to Action): A clean, minimalistic call to action placed in a bottom corner or structured badge (e.g. "COMMENT 'GUIDE' TO ACCESS", "LINK IN BIO", or "JOIN THE ELITE").
4. BRANDING: The brand name "${idea.productName || "LUXE"}" written in small, clean minimalist logo typography in a top corner or bottom corner.`;
  } else {
    sceneGuidelines = `The post type is a single IMAGE. Describe in English a single detailed scene with DYNAMIC CLOTHING (highly detailed, indicating specific style, garment, color, and fit) suited for the location, a warm and authentic expression, and realistic smartphone camera lighting (UGC aesthetic).`;
  }

  let productGuideline = "";
  if (idea.productName && idea.type !== "flyer") {
    productGuideline = `PRODUCT INTEGRATION: The avatar must interact naturally with the following product: "${idea.productName}".
In the DYNAMIC SCENE prompts, include explicit descriptions of where the product is or how she interacts with it (e.g., "holding the ${idea.productName} in her hand with a relaxed smile", "the ${idea.productName} lies on the table next to her", etc.). It must feel like an organic integration of her lifestyle, not an aggressive advertisement.`;
  }

  if (idea.productImage) {
    productGuideline += `\n\nCRITICAL PRODUCT REFERENCE IMAGE RULE (STRICT FIDELITY FOR FLOW):
A reference image of the product has been uploaded. In the DYNAMIC SCENE prompts, you MUST explicitly instruct the generator to display the product "${idea.productName}" EXACTLY as it appears in the uploaded product reference image. Use instructions like: "the product "${idea.productName}" must be a 1:1 identical visual match to the uploaded product reference image, preserving its exact shape, contours, brand logo, label lettering, and color scheme without any alterations or AI styling. The object must look like a pixel-precise replica of the physical item from the reference image."`;
  }

  const EDITORIAL_STYLE = `Ultra-realistic photography style, Sony A7R IV, 85mm lens, f/2.0, RAW image quality. Macro details showing visible skin texture, real pores, peach fuzz, natural skin grain, soft skin imperfections, realistic iris patterns, natural eyelashes, thick organic eyebrows, realistic eye reflections. Physically accurate lighting, realistic color science. Natural and relaxed posture, minimal natural makeup, direct eye contact. No gibberish text, no distorted logos. Negative prompt constraints: cartoon, CGI, 3D render, plastic skin, wax skin, airbrushed skin, over-retouched, fake texture, painting, illustration, low resolution, uncanny valley, excessive symmetry, beauty filter.`;

  const UGC_STYLE = `Shot on iPhone 17 Pro Max, wide angle lens, natural light only, no flash. Slightly overexposed. Real skin texture with natural inconsistencies — uneven tone, Soft makeup, nothing exaggerated, real pores, slight shine from heat and sun. Hair not perfectly styled — a few strands out of place. Expression relaxed, not composed for a camera. Framing slightly imperfect, subject not perfectly centered. The image looks like something posted to Instagram stories without editing. No studio lighting. No cinematic look. No color science adjustments.
Negative prompt constraints: bokeh, blurred background, golden hour, cinematic lighting, soft diffusion, studio lighting, color grading, beauty filter, perfect symmetry, airbrushed skin, plastic skin, 8K, hyper-detailed, Sony camera aesthetic, magazine quality, luxury campaign feel.`;

  const FLYER_STYLE = `High-end commercial editorial magazine photoshoot style, premium fashion photography, raw camera capture, f/2.8 aperture, RAW quality, hyper-detailed 8K resolution. Clear visible skin texture, real pores, realistic skin grain, natural eyelashes, thick organic eyebrows, realistic eye reflections, natural skin complexion. Physically accurate editorial studio lighting or natural outdoor lighting with soft diffusion, realistic color grading. Warm and confident expression, professional relaxed modeling posture, minimal natural makeup, authentic non-airbrushed aesthetic, direct eye contact. No gibberish text on the layout, only the described legible titles, clean margins. Negative prompt constraints: cartoon, CGI, 3D render, plastic skin, wax skin, airbrushed skin, over-retouched skin, artificial face, thick digital makeup, heavy eye shadow, heavy lipstick, fake texture, painting, low resolution, blurry, uncanny valley, skin smoothing filter.`;

  let authenticCreatorStyle = UGC_STYLE;

  if (idea.type === "flyer") {
    authenticCreatorStyle = FLYER_STYLE;
  } else if (idea.promptStyle === "editorial") {
    authenticCreatorStyle = EDITORIAL_STYLE;
  } else if (idea.promptStyle === "ugc") {
    authenticCreatorStyle = UGC_STYLE;
  }

  const MAKEUP_PROTOCOL = `MAKEUP PROTOCOL — Context-adaptive:
LEVEL 1 / GYM & SPORT: No makeup. Natural face, slight sweat shine, real skin only.
LEVEL 2 / CASUAL & LIFESTYLE: Minimal makeup — subtle brow definition, light tinted moisturizer, clear lip balm. Looks effortless, not done up.
LEVEL 3 / GOING OUT & SOCIAL: Natural glam — defined brows, light foundation, soft contour, nude or berry lip, subtle mascara. Polished but not overdone.
LEVEL 4 / FORMAL & EVENTS: Polished glam — flawless base, soft sculpted contour, defined brows, nude-rose or soft berry lip — NEVER dark red or gothic tones. Defined lashes. Looks powerful but still recognizably the character.
Apply the makeup level that matches the scene context automatically. Never leave face bare in formal or social contexts.`;

  const VALIDATED_SCENE_TEMPLATES = `VALIDATED SCENE TEMPLATES (Draw inspiration from these exact validated style guidelines based on the scene context):
1. CAR / STREET SCENE (UGC, mid-day, outdoor):
- Outfit: Sleek black sunglasses, off-white ribbed tank top, high-waisted black leggings, thin silver chain necklace.
- Context/Setting: Inside the driver's seat of a modern SUV parked on Collins Avenue, Miami Beach, FL. Windshield view is sharp and in focus showing traffic, palm trees, buildings, overexposed sky. No bokeh. Natural harsh sunlight.
- Makeup: Level 2 (Minimal makeup).

2. ROOFTOP DINING / EVENING SCENE (Editorial/UGC, dusk/night, outdoor):
- Outfit: Fitted black velvet mini dress with long sleeves and a side slit, black strappy heels.
- Context/Setting: Luxury rooftop terrace in Brickell, Miami, at dusk. Skyline fully visible and lit up in focus. String lights, a small candle on a table, holding a glass of red wine.
- Makeup: Level 3-4 (Natural or polished glam).

3. GYM WORKOUT SCENE (UGC, indoor, active):
- Outfit: Black seamless sports bra and matching black leggings. Hair in a messy ponytail or loose bun, wet from sweat.
- Context/Setting: Sitting on the gym floor, back against a white wall. Gym equipment visible (dumbbells, mats, weight plates). Glistening sweaty skin with natural shine.
- Makeup: Level 1 (No makeup, real skin).

4. POOL / WATER SCENE (UGC, mid-day, outdoor):
- Outfit: Simple black one-piece athletic swimsuit. Wet hair slicked back naturally, a few strands on face.
- Context/Setting: Standing at the edge of a rooftop pool in Miami. Bright harsh sun, hard shadows. Pool water, lane lines, wet concrete deck in focus. No bokeh.
- Makeup: Level 1 (No makeup).

5. CAFÉ / CASUAL LIFESTYLE (UGC, late morning, indoor):
- Outfit: Oversized white linen button-up shirt (sleeves rolled up), small gold hoop earrings.
- Context/Setting: Sitting at a small table inside a modern Miami café. Natural soft light from large window. Holding a ceramic flat white coffee cup. Café interior in focus (tables, people, brick wall, chalkboard menu).
- Makeup: Level 2 (Minimal makeup).`;

  const isVideo = idea.type === "video";
  const videoAudioPromptTemplate = isVideo
    ? `---
AUDIO PERFORMANCE:
${audioLanguage === "silent" 
    ? "AUDIO: No dialogue, no voice, no voiceover. Absolute silence / background ambient sound only. The video is purely illustrative (B-Roll) and the avatar is not speaking." 
    : audioLanguage === "voiceover" 
      ? `AUDIO: Voiceover narration (Voz en off). The avatar is NOT speaking on camera (lips are closed and relaxed), but we hear her voice narrating in the background, describing what she does or the idea she wants to convey. Use the following voice characteristics:\n${avatar.audioSettings}`
      : audioLanguage === "en" 
        ? "ACCENT: Native English speaker with a clear, warm, and natural US American accent. Zero foreign or Spanish accent. Authentic native pronunciation.\nPAUSES: Natural rhythm and breathing spaces.\nMICROPHONE: High-quality smartphone vocal note (vibrant, close, authentic).\nSPEED: Dynamic, engaging, and slightly fast, expressing enthusiasm." 
        : avatar.audioSettings}
VIDEO PERFORMANCE:
${avatar.videoSettings}`
    : "";

  const systemPrompt = `Eres un ingeniero de prompts experto en la plataforma "Flow de Gemini".
Tu tarea es generar un prompt altamente detallado y estructurado de acuerdo a los requerimientos de la plataforma Flow.
La escena que debemos describir es: "${idea.title} - ${idea.scenePrompt}". Ubicación: ${idea.location}. Tipo: ${idea.type}.

${sceneGuidelines}
${productGuideline}
${MAKEUP_PROTOCOL}
${VALIDATED_SCENE_TEMPLATES}

DYNAMIC CLOTHING VARIETY & SCENE FREEDOM:
- CRITICAL FREEDOM & DIVERSITY RULE: The 5 validated scene templates provided above are strictly for quality, structure, and level alignment reference. You must NOT copy their exact locations or outfits (like the black dress on a rooftop or the white linen shirt) unless the idea being processed specifically calls for them. Feel 100% free to invent entirely original, fresh, and colorful settings and outfits for every prompt.
- The avatar's outfit must be highly dynamic, fashionable, and directly match the specific location, weather, and context of the scene.
- For cold locations (like autumn/winter in New York), use stylish coats, leather jackets, wool sweaters, or scarves.
- For tropical settings, beaches, or summer environments, use colorful casual summer dresses (e.g., in emerald green, royal blue, crimson red), tank tops, activewear, or beachwear.
- For business, office, or formal settings, use smart-casual blazers, stylish blouses, or professional attire.
- CRITICAL: Do NOT default to linen clothing, beige shirts, or neutral linen fabrics unless the user's scene prompt explicitly requests it. Create a diverse, colorful, and modern wardrobe suited for a real lifestyle influencer. Keep the settings varied: streets, art districts, balconies, yachts, parks, hotel lobbies. Do not overuse rooftops or black dresses.

CRÍTICO DE FORMATO:
- El tipo de publicación es "${idea.type}". ${isVideo ? "Como es un video, debes incluir obligatoriamente las secciones de AUDIO PERFORMANCE y VIDEO PERFORMANCE descritas abajo." : "Como no es un video, NO debes incluir ninguna sección de audio o video performance; el prompt debe terminar limpiamente en la sección PRODUCT REFERENCE."}

CRITICAL VISUAL CONSTRAINT:
- Legible and clear text is allowed ONLY when explicitly specified in the prompt. If the scene requires text (e.g., on a paper, sticky note, whiteboard, card, screen, sign, or billboard), specify the exact text clearly in English inside double quotation marks (e.g., showing the text "START NOW").
- Prevent AI gibberish text: Absolutely no garbled text, distorted letters, weird characters, or meaningless symbols are allowed. Ambient backgrounds, buildings, or unrelated items must be kept clean, abstract, or blank with no readable writing.
- The output images/videos must be ultra-realistic, natural, and raw. Avoid any artificial glossy CGI look, clean renders, or generic AI aesthetics. Focus on raw lighting, high fidelity skin textures, visible skin pores, realistic skin grain, peach fuzz, and natural details.

CRITICAL BACKGROUND & BOKEH CONSTRAINT (UGC MODE):
- The background MUST ALWAYS BE IN SHARP FOCUS. Never describe a blurry background, bokeh, out of focus elements, depth of field, or soft focus.
- In the DYNAMIC SCENE section, specify that the background, setting, buildings, street elements, or other people are completely sharp, clear, and in focus. The scene must have no background blur whatsoever.

CRITICAL BRACKET FORMATTING RULE:
- The DYNAMIC SCENE description MUST be enclosed strictly inside square brackets [ ... ]. For example: "DYNAMIC SCENE: [The avatar is standing...]"
- The MAKEUP LEVEL TO APPLY section MUST only contain the level identifier inside square brackets, e.g. "MAKEUP LEVEL TO APPLY: [LEVEL 2]". Do not include any descriptions or extra text inside the brackets, just the level code.

REPEATING OBJECTS ANALYSIS:
- If this is a video or carousel and there are any physical objects (such as a specific coffee mug, fintech card, passport, bag, laptop, phone model, etc.) that repeat across different SHOTs or PHOTOs, identify them. You will list them at the very bottom in a section called "REPEATING INGREDIENTS".

Debes formatear el resultado exactamente con las siguientes secciones:

HIGH-FIDELITY CHARACTER DNA: [${avatar.characterDna}] Master.

${MAKEUP_PROTOCOL}

DYNAMIC SCENE: [Escribe aquí la descripción resultante redactada íntegramente en inglés basada en las directrices de arriba, de entre 150 y 250 palabras. Si es un video o carrusel, redacta los SHOT X / PHOTO X correspondientes. ESTA SECCIÓN DEBE EMPEZAR CON LÓBULO DE CORCHETE '[' Y TERMINAR CON ']'.]

MAKEUP LEVEL TO APPLY: [Determina automáticamente el nivel de maquillaje para esta escena de acuerdo a las pautas y escríbelo aquí estrictamente en formato [LEVEL X], sin textos explicativos adicionales adentro de los corchetes, ej: [LEVEL 1] o [LEVEL 2] o [LEVEL 3] o [LEVEL 4]]

AUTHENTIC CREATOR: ${authenticCreatorStyle}

REPEATING INGREDIENTS: [Identify any physical objects that repeat in multiple scenes so the user can upload a consistent reference image in Flow, e.g., "red leather passport, silver laptop". If there are none, write "None".]

PRODUCT REFERENCE: ${idea.productImage ? `The product "${idea.productName}" must be a 1:1 identical match to the uploaded reference image. The image generator must extract and copy the exact logo, text label, shape, proportions, and details of the product from the uploaded reference image, rendering it realistically in the scene with zero variations.` : 'None'}
${videoAudioPromptTemplate}

Reglas importantes:
- La sección DYNAMIC SCENE debe estar redactada en inglés (es mejor para los motores generativos visuales) y describir fielmente la escena de viajes/lifestyle solicitada.
- Devuelve únicamente el prompt estructurado resultante sin comentarios adicionales ni bloques de código markdown.`;

  try {
    return await callDeepSeek(apiKey, systemPrompt, "Genera el prompt estructurado exclusivo de la plataforma Flow.", false);
  } catch (error) {
    console.error("Error generating Flow prompt with DeepSeek:", error);
    throw error;
  }
}

// 3. Generar pie de foto (Caption) para Instagram (Estilo Directo de Milena Reyes)
export async function generateInstagramCaption(
  avatar: AvatarIdentity,
  idea: PostIdea,
  apiKey: string | undefined
): Promise<string> {

  const systemPrompt = `Eres ${avatar.name}, una Avatar UGC e Influencer de Inteligencia Artificial.
Tus datos de identidad son:
- Nombre: ${avatar.name}
- Nicho: ${avatar.niche}
- Ubicación actual: ${avatar.location}
- Historia: ${avatar.backstory}
- Tono de voz y personalidad: ${avatar.toneOfVoice}

Redacta el pie de foto (Caption) de Instagram para la siguiente publicación:
- Título del post: "${idea.title}"
- Escena de la imagen/video: "${idea.scenePrompt}"

Instrucciones de formato y estructura (NUEVO ESTILO DIRECTO Y DE ACTITUD):
1. IDIOMA: Redactado única y exclusivamente en español. Queda totalmente prohibido el formato bilingüe o el uso de la barra vertical "|" para separar español e inglés. El texto principal debe fluir en español natural y con carácter.
2. ESTRUCTURA CRÍTICA DE 3 BLOQUES (deben estar separados exactamente por una línea en blanco):
   - LÍNEA 1: Frase de apertura o gancho directo, sin rodeos ni saludos, que obligue a seguir leyendo.
   
   - LÍNEA 2-4: Desarrollo corto en 2 o 3 líneas máximo. Concreto, potente, directo al grano y sin explicaciones innecesarias.
   
   - LÍNEA FINAL: Cierre con actitud. NO hagas preguntas genéricas del tipo "¿Qué opinas?" o "¿Y tú?". Debe ser una afirmación rotunda, una provocación o un reto con personalidad y seguridad.
3. ESPACIADO: Deja obligatoriamente una línea en blanco entre cada uno de los 3 bloques principales y el bloque de hashtags.
4. EMOJIS: Máximo 2 o 3 en todo el post. Nunca los uses como relleno o decoración; úsalos únicamente si aportan significado o fuerza al tono.
5. HASHTAGS: Añade entre 5 y 8 hashtags virales al final (por ejemplo: #milenareyes #fitness #miami y similares), mezclando español e inglés de forma orgánica.
6. FILTRADO DE PALABRAS: Queda prohibido usar palabras cursis o clichés como: "amores", "besitos", "chicos", "increíble" (como muletilla) o "manifestar".
7. REGLA NO COMERCIAL: Prohibido sugerir enlaces de venta, prometer bonos de dinero o realizar CTA comerciales de afiliación.

Devuelve únicamente el pie de foto final, respetando las líneas en blanco y sin añadir comillas externas ni comentarios aclaratorios.`;

  try {
    return await callDeepSeek(apiKey, systemPrompt, "Redacta el copy de Instagram al nuevo estilo de Milena Reyes.", false);
  } catch (error) {
    console.error("Error generating Instagram caption with DeepSeek:", error);
    throw error;
  }
}

// 4. Generar la respuesta del chatbot del avatar para DMs de Instagram
export async function generateChatResponse(
  avatar: AvatarIdentity,
  messages: ChatMessage[],
  apiKey: string | undefined
): Promise<string> {
  const systemPrompt = `Eres ${avatar.name}, una Avatar UGC e Influencer.
Identidad: ${avatar.niche}.
Historia: ${avatar.backstory}
Tono de voz: ${avatar.toneOfVoice}

Estás chateando en privado (DMs de Instagram) con un seguidor que admira tu disciplina, tus rutinas de gimnasio, tu estilo de vida en Miami y tu actitud real y fuerte.
Tu objetivo es interactuar de forma sumamente amigable, empática y natural, respondiendo a sus preguntas de lifestyle, fitness, entrenamientos o motivación personal.

Reglas del chat:
- Sé natural, de trato cercano y conversacional. 
- Mantén las respuestas muy cortas (máximo 2-3 oraciones). En redes sociales nadie lee párrafos largos.
- REGLA DE ORO: Prohibido ofrecer o hablar sobre herramientas de monetización, inversiones, enlaces de afiliados, productos financieros, dinero, o pedir que comenten palabras clave para recibir bonos. No estás vendiendo nada ni haciendo promociones comerciales.
- Comparte consejos prácticos de estilo de vida, recomienda lugares (restaurantes, gimnasios, destinos de viaje) o brinda palabras de motivación y constancia de forma natural si te lo piden.`;

  const finalApiKey = apiKey || process.env.DEEPSEEK_API_KEY;
  if (!finalApiKey) {
    throw new Error("API Key de DeepSeek no configurada.");
  }

  // Mapear historial de chat directamente a la API de DeepSeek
  const chatMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map(m => ({
      role: m.sender === "avatar" ? ("assistant" as const) : ("user" as const),
      content: m.text
    }))
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${finalApiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: chatMessages,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("Error generating chat response with DeepSeek:", error);
    throw new Error(error.message || "Error en el chat de DeepSeek.");
  }
}

// 5. Generar estructura de Setup de Cuenta Viral (Instagram & TikTok)
export async function generateAccountSetup(
  avatar: AvatarIdentity,
  apiKey: string | undefined
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

// 6. Expansión de Identidad de Avatar (UGC Avatar Studio v2.0)
export async function expandAvatarIdentity(
  gender: string,
  niche: string,
  location: string,
  apiKey: string | undefined
): Promise<{
  nombre_completo: string;
  edad: number;
  backstory: string;
  character_dna: string;
  audio_settings: string;
  video_performance: string;
}> {
  const systemPrompt = `Eres el Arquitecto de Identidades B2B de VirtualSoul Agency. Tu tarea es recibir parámetros mínimos de un nuevo avatar de marca y expandirlos en un perfil de identidad lógico, comercial y de generación técnica sintética.

Debes analizar el Género, el Nicho de mercado, la Raza/Etnia y la Ubicación solicitada para estructurar la psicología, el trasfondo narrativo y las descripciones técnicas en inglés para el motor de imágenes fijas fotorrealistas.

REGLAS ESTRICTAS DE RESPUESTA:
1. Devuelve EXCLUSIVAMENTE un objeto JSON estructurado con las llaves que se detallan a continuación.
2. No agregues texto introductorio, explicaciones, ni bloques de código de marcado markdown (como \`\`\`json).
3. El campo "character_dna" debe redactarse obligatoriamente en INGLÉS y estructurarse como un prompt descriptivo, fotorrealista y denso, enfocándose en texturas de piel reales, imperfecciones y rasgos físicos consistentes.

ESTRUCTURA DEL JSON ESPERADO:
{
  "nombre_completo": "Nombre de pila y apellido coherente con la etnia y ubicación",
  "edad": Número entero entre 24 y 35 (coherente con el nicho comercial),
  "backstory": "Texto en español. Descripción detallada de dolores pasados, transformación y el objetivo del avatar en las redes sociales. Enfoque narrativo humano y aspiracional.",
  "character_dna": "Technical English physical prompt description. Must include: ethnicity, detailed hair color, texture and length, eyebrow structure, eye color, specific skin tone and skin imperfections (visible pores, micro-textures), facial structure bone density (jawline, cheekbones), default realistic expression, and initial simple fitted clothing definition.",
  "audio_settings": "Texto en español. Especificación técnica del idioma, acento geográfico exacto, tono comunicativo (directo, seguro, sin relleno) y modismos prohibidos.",
  "video_performance": "Texto en español. Instrucciones de lenguaje corporal frente a la cámara, dirección de la mirada, contacto visual fijo y control de gesticulación."
}`;

  const userPrompt = `DATOS DE ENTRADA PROVISTOS POR LA UI:
- Género: ${gender}
- Nicho / Ángulo: ${niche}
- Raza - Etnia / Ubicación: ${location}`;

  try {
    const rawText = await callDeepSeek(apiKey, systemPrompt, userPrompt, true);
    if (!rawText) {
      throw new Error("La API de DeepSeek devolvió una respuesta vacía.");
    }

    // Sanitización Estricta (QA Protocol):
    // Validar que el JSON recibido de la API externa no contenga caracteres de escape rotos que invaliden el renderizado HTML de los bloques de texto.
    let cleanText = rawText.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    // Remover caracteres de control no válidos en JSON
    cleanText = cleanText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    const result = JSON.parse(cleanText);

    // Validar llaves requeridas
    const requiredKeys = ["nombre_completo", "edad", "backstory", "character_dna", "audio_settings", "video_performance"];
    for (const key of requiredKeys) {
      if (!(key in result)) {
        throw new Error(`La respuesta de la IA no contiene la llave requerida: ${key}`);
      }
    }

    // Aislamiento del DNA (QA Protocol):
    // Comprobar que en el campo character_dna solo se guarde la cadena pura en inglés optimizada, excluyendo los textos fijos de estilo del pipeline.
    if (result.character_dna) {
      let dna = String(result.character_dna).trim();
      dna = dna.replace(/^HIGH-FIDELITY CHARACTER DNA:\s*/gi, "");
      dna = dna.replace(/^\[/g, "").replace(/\]\s*Master\.?$/gi, "");
      dna = dna.replace(/Master\.?$/gi, "");
      dna = dna.trim();
      result.character_dna = dna;
    }

    return result;
  } catch (error: any) {
    console.error("Error al expandir identidad en deepseek.ts:", error);
    throw new Error(`Error en el Protocolo QA de Expansión de Identidad: ${error.message}`);
  }
}

