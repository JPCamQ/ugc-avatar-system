// Módulo de base de datos en localStorage para el Ecosistema Multi-Avatar UGC

export interface AvatarIdentity {
  id: string; // ID único (ej. milena_reyes)
  name: string;
  age: number;
  niche: string;
  location: string;
  backstory: string;
  monetizationLink: string;
  monetizationProduct: string;
  toneOfVoice: string;
  language: string;
  characterDna: string;
  audioSettings: string;
  videoSettings: string;
  avatarImage?: string; // Almacenará la foto en base64 (límite de ~2MB)
  gender?: string; // Género para control de pronombres en fijación base
}

export type GrowthPhase = "storytelling" | "value" | "conversion";

export interface PostIdea {
  id: string;
  avatarId: string; // Clave foránea asociada al avatar
  title: string;
  type: "image" | "carousel" | "video" | "flyer";
  location: string;
  phase: GrowthPhase; // Para compatibilidad, siempre storytelling
  scenePrompt: string;
  formattedFlowPrompt: string;
  instagramCaption: string;
  status: "draft" | "generated" | "published";
  createdAt: string;
  productImage?: string; // Imagen del producto patrocinado en base64
  productName?: string;  // Nombre del producto o marca patrocinada
  promptStyle?: "ugc" | "editorial"; // Estilo de generación del prompt
}

export interface ChatMessage {
  id: string;
  sender: "user" | "avatar";
  text: string;
  timestamp: string;
}

export interface ChatSimulation {
  id: string;
  avatarId: string; // Clave foránea
  userName: string;
  userBio: string;
  messages: ChatMessage[];
  status: "active" | "converted" | "lost";
  notes?: string;
}

// Configuración inicial del primer avatar: Milena Reyes (Fitness & Lifestyle)
export const DEFAULT_AVATAR: AvatarIdentity = {
  id: "milena_reyes",
  name: "Milena Reyes",
  age: 26,
  niche: "Fitness & Lifestyle",
  location: "Miami, FL",
  backstory: "Nació en Caracas, Venezuela, en una familia de clase media con hambre de más. A los 24 se mudó a Miami con una maleta y una obsesión: construir la versión más fuerte de sí misma. No huyó de nada — eligió algo. El gym fue lo primero que encontró. Después llegó el estilo, la disciplina, la ciudad. Hoy a sus 26, Milena no documenta una vida perfecta — documenta una vida construida a propósito. Entrena duro, vive con intención, y no pide disculpas por ninguna de las dos cosas. Es virtual. Pero la actitud es real.",
  monetizationLink: "",
  monetizationProduct: "",
  toneOfVoice: "SÍ ES: Mujer que construye algo real, que entrena porque lo necesita, que comparte porque le sale natural, no porque quiera likes. Directa, segura, sin relleno. Dice lo que piensa. Palabras clave que usa: disciplina, proceso, construir, intención, real, fuerte. Palabras que nunca usa: 'amores', 'besitos', 'chicos', 'increíble' como muletilla, 'manifestar'. Idioma de contenido: Español principalmente. Inglés en frases clave o posts específicos para audiencia Miami/global.",
  language: "Español con frases clave en inglés",
  characterDna: `Photorealistic photograph of a 26-year-old Latina woman named Milena Reyes. Venezuelan origin, Miami lifestyle. Natural dark auburn/red wavy hair, medium length. Strong defined eyebrows, light hazel-green eyes, olive skin with natural texture and visible real pores. Athletic and toned physique — not bodybuilder, functional fitness body. High cheekbones, sharp jawline, serious default expression that breaks into confidence, never into forced smiles. Style ranges from performance sportswear to clean casual luxury. Always looks like she owns the room without trying.`,
  audioSettings: `IDIOMA: Español latino neutro con acento venezolano suave. Comprensible para todo LATAM y España.
TONO: Directa, segura, sin relleno. No dice "chicos" ni "amores". Dice lo que piensa.
RITMO: Dinámico, pausas intencionales, nunca apresurado.
MICRÓFONO: Audio de smartphone de alta calidad, cercano y natural — como nota de voz premium.
ENERGÍA: Motivadora sin ser coach de autoayuda. Inspira desde la acción, no desde el discurso.`,
  videoSettings: `CONTACTO VISUAL: Directo con la cámara. No esquiva. No pestañea en exceso. Presencia.
GESTICULACIÓN: Movimientos de manos naturales y controlados. Nada exagerado.
POSTURAS: Atlética pero relajada. De pie en el gym, sentada en cafeterías, caminando en exteriores Miami.
TEXTO EN PANTALLA: Cero texto, subtítulos ni etiquetas superpuestas en video.
AMBIENTE: Gym moderno, apartamento minimalista Miami, exteriores urbanos soleados, cafeterías premium.`
};
