import { AvatarIdentity, PostIdea, ChatMessage } from "./types";
import { getExpandAvatarPrompt, getAgencyShowcasePrompt } from "./prompts/avatar";
import { getPostIdeasPrompt, getPromptFlowPrompt, getInstagramCaptionPrompt } from "./prompts/planner";
import { getChatSystemPrompt } from "./prompts/chat";
import { getAccountSetupPrompt } from "./prompts/setup";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Helper genérico para llamar a la API de DeepSeek mediante fetch nativo con retry logic y timeout
export async function callDeepSeek(
  apiKey: string | undefined,
  messages: DeepSeekMessage[],
  jsonMode = false,
  retries = 3,
  delayMs = 1000
): Promise<string> {
  const finalApiKey = (!apiKey || apiKey === "SERVER_DEFAULT_KEY") ? process.env.DEEPSEEK_API_KEY : apiKey;

  if (!finalApiKey) {
    throw new Error("API Key de DeepSeek no configurada. Por favor indíquela en los ajustes o contacte al administrador.");
  }

  let lastError: unknown = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    // Controlador de Aborto para timeout de 30 segundos — se crea de nuevo para cada reintento
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
          messages,
          response_format: jsonMode ? { type: "json_object" } : undefined,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        let parsedErr: { error?: { message?: string } } | null = null;
        try {
          parsedErr = JSON.parse(errText);
        } catch {
          // Ignorar fallo de parseo
        }
        const errMsg = parsedErr?.error?.message || errText || response.statusText;
        throw new Error(`DeepSeek API Error: ${response.status} - ${errMsg}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      lastError = error;
      
      const isAbortError = error instanceof Error && error.name === "AbortError";
      
      // Si fue un aborto voluntario por timeout, reintentamos si quedan intentos
      if (isAbortError) {
        console.warn(`Timeout de 30 segundos en la petición a DeepSeek (intento ${attempt + 1}/${retries}).`);
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
          continue;
        } else {
          throw new Error("La petición a DeepSeek excedió el tiempo límite de 30 segundos.");
        }
      }
      
      // Espera con retroceso exponencial antes de reintentar
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
  }
  
  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("Error desconocido al llamar a DeepSeek.");
}

function cleanJsonString(text: string): string {
  if (!text) return "[]";
  let cleaned = text.trim();
  
  // 1. Quitar bloques de código Markdown (```json o ```)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?\s*/i, "").replace(/```$/, "").trim();
  }
  
  // 2. Extraer desde el primer corchete/llave hasta el último
  const firstBracket = cleaned.match(/[\[\{]/);
  if (firstBracket && firstBracket.index !== undefined) {
    const startChar = firstBracket[0];
    const endChar = startChar === "[" ? "]" : "}";
    const lastBracketIndex = cleaned.lastIndexOf(endChar);
    if (lastBracketIndex !== -1 && lastBracketIndex > firstBracket.index) {
      cleaned = cleaned.substring(firstBracket.index, lastBracketIndex + 1);
    }
  }
  
  // 3. Remover caracteres de control no válidos
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
  
  return cleaned;
}

// 1. Generar ideas de publicaciones (Lifestyle & Storytelling Cosmopolita)
export async function generatePostIdeas(
  avatar: AvatarIdentity,
  apiKey: string | undefined,
  customContext?: string
): Promise<Array<{ title: string; type: "image" | "carousel" | "video" | "flyer"; location: string; description: string }>> {
  const systemPrompt = getPostIdeasPrompt(avatar, customContext);
  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Genera las 5 ideas de publicaciones en formato JSON de acuerdo a las directrices de lifestyle." }
  ];

  try {
    const text = await callDeepSeek(apiKey, messages, true);
    const cleaned = cleanJsonString(text);
    return JSON.parse(cleaned);
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
  const systemPrompt = getPromptFlowPrompt(avatar, idea, audioLanguage);
  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Genera el prompt estructurado exclusivo de la plataforma Flow." }
  ];

  try {
    return await callDeepSeek(apiKey, messages, false);
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
  const systemPrompt = getInstagramCaptionPrompt(avatar, idea);
  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Redacta el copy de Instagram al nuevo estilo de Milena Reyes." }
  ];

  try {
    return await callDeepSeek(apiKey, messages, false);
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
  const systemPrompt = getChatSystemPrompt(avatar);

  const chatMessages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages.map(m => ({
      role: m.sender === "avatar" ? ("assistant" as const) : ("user" as const),
      content: m.text
    }))
  ];

  try {
    return await callDeepSeek(apiKey, chatMessages, false);
  } catch (error: unknown) {
    console.error("Error generating chat response with DeepSeek:", error);
    const message = error instanceof Error ? error.message : "Error en el chat de DeepSeek.";
    throw new Error(message);
  }
}

// 5. Generar estructura de Setup de Cuenta Viral (Instagram & TikTok)
export async function generateAccountSetup(
  avatar: AvatarIdentity,
  apiKey: string | undefined
): Promise<{ usernames: string[]; bios: string[]; gridPlan: string[]; seoTips: string[] }> {
  const systemPrompt = getAccountSetupPrompt(avatar);
  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Genera las pautas de setup de cuenta en formato JSON." }
  ];

  try {
    const text = await callDeepSeek(apiKey, messages, true);
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
  apiKey: string | undefined,
  bodyType: string
): Promise<{
  nombre_completo: string;
  edad: number;
  backstory: string;
  character_dna: string;
  audio_settings: string;
  video_performance: string;
}> {
  const { systemPrompt, userPrompt } = getExpandAvatarPrompt(gender, niche, location, bodyType);
  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  try {
    const rawText = await callDeepSeek(apiKey, messages, true);
    if (!rawText) {
      throw new Error("La API de DeepSeek devolvió una respuesta vacía.");
    }

    // Sanitización Estricta (QA Protocol):
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
    if (result.character_dna) {
      let dna = String(result.character_dna).trim();
      dna = dna.replace(/^HIGH-FIDELITY CHARACTER DNA:\s*/gi, "");
      dna = dna.replace(/^\[/g, "").replace(/\]\s*Master\.?$/gi, "");
      dna = dna.replace(/Master\.?$/gi, "");
      dna = dna.trim();
      result.character_dna = dna;
    }

    return result;
  } catch (error: unknown) {
    console.error("Error al expandir identidad en deepseek.ts:", error);
    const message = error instanceof Error ? error.message : "Error desconocido en el protocolo QA de expansión.";
    throw new Error(`Error en el Protocolo QA de Expansión de Identidad: ${message}`);
  }
}

// 7. Generar Showcase de Muestra de la Agencia (UGC Showcase v2.0)
export async function generateAgencyShowcase(
  apiKey: string | undefined,
  gender: string
): Promise<{
  avatar_info: {
    nombre: string;
    detalles: string;
    dna_fisico: string;
  };
  carrusel_prompts: {
    dynamic_scene: string;
    makeup_level: string;
  };
  instagram_caption: string;
}> {
  const systemPrompt = getAgencyShowcasePrompt(gender);
  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Genera el showcase en formato JSON." }
  ];

  try {
    const rawText = await callDeepSeek(apiKey, messages, true);
    if (!rawText) {
      throw new Error("La API de DeepSeek devolvió una respuesta vacía.");
    }

    const cleanText = cleanJsonString(rawText);
    const result = JSON.parse(cleanText);

    // Validar llaves del JSON
    if (!result.avatar_info || !result.carrusel_prompts || !result.instagram_caption) {
      throw new Error("El JSON no tiene la estructura requerida.");
    }

    // QA Protocol: Aislamiento del DNA para el avatar ficticio
    if (result.avatar_info.dna_fisico) {
      let dna = String(result.avatar_info.dna_fisico).trim();
      dna = dna.replace(/^HIGH-FIDELITY CHARACTER DNA:\s*/gi, "");
      dna = dna.replace(/^\[/g, "").replace(/\]\s*Master\.?$/gi, "");
      dna = dna.replace(/Master\.?$/gi, "");
      dna = dna.trim();
      result.avatar_info.dna_fisico = dna;
    }

    return result;
  } catch (error: unknown) {
    console.error("Error generating agency showcase in deepseek.ts:", error);
    const message = error instanceof Error ? error.message : "Error desconocido al generar el showcase.";
    throw new Error(`Error al generar showcase: ${message}`);
  }
}
