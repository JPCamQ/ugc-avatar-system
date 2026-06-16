/**
 * Utilidades compartidas del sistema de avatares UGC
 */
import { AvatarIdentity } from "./db";

// Validador simple de API Key
export const isKeyValid = (key: string): boolean => {
  return typeof key === "string" && key.trim() !== "" && key.trim() !== "undefined";
};

// Ofuscación y desofuscación simple de API Key para localStorage
export const encodeApiKey = (key: string): string => {
  if (!key) return "";
  try {
    return btoa(key);
  } catch (e) {
    return key;
  }
};

export const decodeApiKey = (encodedKey: string): string => {
  if (!encodedKey) return "";
  try {
    return atob(encodedKey);
  } catch (e) {
    return encodedKey;
  }
};

// Generador de IDs únicos y seguros
export const generateId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ugc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Parser para extraer prompts individuales estructurados de tomas de video o fotos de carrusel
export const parsePromptSteps = (
  fullPrompt: string,
  type: "carousel" | "video" | "image" | "flyer"
): Array<{ label: string; text: string; fullText: string }> => {
  const rawType = String(type).toLowerCase();
  const isCarousel = rawType === "carousel" || rawType === "carrusel";
  const isVideo = rawType === "video" || rawType === "reels" || rawType === "reel";
  if (!fullPrompt || (!isCarousel && !isVideo)) return [];
  
  // 1. Encontrar el inicio de DYNAMIC SCENE de manera robusta
  const dynamicSceneIndex = fullPrompt.search(new RegExp("DYNAMIC SCENE:", "i"));
  if (dynamicSceneIndex === -1) return [];
  
  const startPos = dynamicSceneIndex + "DYNAMIC SCENE:".length;
  const slice = fullPrompt.substring(startPos);
  
  // Encontrar el inicio de la siguiente sección (AUTHENTIC CREATOR, AUDIO PERFORMANCE, VIDEO PERFORMANCE, MAKEUP LEVEL TO APPLY, o separador ---)
  const nextSectionRegex = new RegExp("(\\s*(?:\\*?\\*?\\b(?:AUTHENTIC CREATOR|AUDIO PERFORMANCE|VIDEO PERFORMANCE|MAKEUP LEVEL TO APPLY)\\b|---))", "i");
  const nextSectionMatch = slice.match(nextSectionRegex);
  
  const endPos = nextSectionMatch && nextSectionMatch.index !== undefined
    ? startPos + nextSectionMatch.index
    : fullPrompt.length;
    
  const dynamicSceneText = fullPrompt.substring(startPos, endPos).trim();
  
  // Obtener la cabecera original del prompt antes de DYNAMIC SCENE
  const header = fullPrompt.substring(0, dynamicSceneIndex);
  
  // Obtener la parte final del prompt después de DYNAMIC SCENE
  const postScene = fullPrompt.substring(endPos).trim();
  
  const steps: Array<{ label: string; text: string; fullText: string }> = [];
  
  // Expresión regular robusta para los pasos (PHOTO 1, SHOT 1, FOTO 1, etc.)
  const labelRegex = isCarousel 
    ? new RegExp("(\\*?\\*?\\b(?:PHOTO|FOTO|IMAGE|IMAGEN)\\b\\s*\\d+\\s*:?\\*?\\*?[\\s\\S]*?)(?=\\s*(?:\\*?\\*?\\b(?:PHOTO|FOTO|IMAGE|IMAGEN)\\b\\s*\\d+\\s*:?\\*?\\*?)|$)", "gi")
    : new RegExp("(\\*?\\*?\\b(?:SHOT|TOMA|VIDEO)\\b\\s*\\d+\\s*:?\\*?\\*?[\\s\\S]*?)(?=\\s*(?:\\*?\\*?\\b(?:SHOT|TOMA|VIDEO)\\b\\s*\\d+\\s*:?\\*?\\*?)|$)", "gi");
    
  const matches = Array.from(dynamicSceneText.matchAll(labelRegex));
  
  if (matches.length > 0) {
    matches.forEach((match, index) => {
      const stepContent = match[1].trim();
      const label = isCarousel ? `Foto ${index + 1}` : `Toma ${index + 1}`;
      // Reconstruir el prompt estructurado completo para este paso individual
      const singlePrompt = `${header}DYNAMIC SCENE: ${stepContent}\n\n${postScene}`;
      steps.push({
        label,
        text: stepContent,
        fullText: singlePrompt
      });
    });
  }
  
  return steps;
};

// Parser para extraer los ingredientes repetidos de la sección REPEATING INGREDIENTS
export const parseRepeatingIngredients = (fullPrompt: string): string => {
  if (!fullPrompt) return "";
  const match = fullPrompt.match(new RegExp("REPEATING INGREDIENTS:\\s*([\\s\\S]*?)(?=\\n[A-Z-]{3,}|\\n---|\\s*$)", "i"));
  if (!match) return "";
  const text = match[1].trim();
  const cleanLower = text.toLowerCase();
  if (cleanLower === "none" || cleanLower === "none." || cleanLower.includes("[none]")) return "";
  return text;
};

// Generador del prompt maestro de Retrato de ADN (Fijación Base) con lógica inteligente de pronombres
export function getBasePortraitPrompt(avatar: AvatarIdentity): string {
  const genderLower = (avatar.gender || "").toLowerCase();
  const isMale = genderLower.includes("masc") || genderLower.includes("hombre") || genderLower.includes("male") || genderLower.includes("man") || avatar.id === "mateo_novak";
  
  const possessive = isMale ? "his" : "her";
  const pronoun = isMale ? "he" : "she";

  return `HIGH-FIDELITY CHARACTER DNA: [${avatar.characterDna}] Master.

DYNAMIC SCENE: [Standing indoors against a completely plain, flat, neutral light grey studio background. Even, soft natural light coming from a side window, casting subtle realistic shadows that define ${possessive} facial structure and jawline.]

AUTHENTIC CREATOR: Shot on iPhone 17 Pro Max, wide angle lens, natural light only, no flash. Slightly overexposed. Real skin texture with natural inconsistencies — uneven tone, real pores, slight shine from heat. Hair not perfectly styled – a few strands out of place. Framing slightly imperfect, subject not perfectly centered. The image looks like a raw, unedited front-facing camera snapshot ${pronoun} posted to ${possessive} Instagram stories. No studio lighting. No cinematic look. No color science adjustments.

Negative prompt constraints: bokeh, blurred background, golden hour, cinematic lighting, soft diffusion, studio lighting, color grading, beauty filter, perfect symmetry, airbrushed skin, plastic skin, 8K, hyper-detailed, Sony camera aesthetic, magazine quality, luxury campaign feel, soft studio light, gradient background, professional portrait photography setup.`;
}
