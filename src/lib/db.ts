// Módulo de base de datos en localStorage para el Ecosistema Multi-Avatar UGC

export interface AvatarIdentity {
  id: string; // ID único (ej. milena_basset)
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

// Configuración inicial del primer avatar: Milena Basset (Lifestyle de Lujo)
export const DEFAULT_AVATAR: AvatarIdentity = {
  id: "milena_basset", // ID definitivo para evitar confusión Valeria/Milena
  name: "Milena Basset",
  age: 28,
  niche: "Lifestyle de Lujo, Fitness & Marca Personal de Éxito",
  location: "Caracas, Venezuela (viajando por el mundo)",
  backstory: "Nacida en Caracas, Venezuela. A sus 28 años, es una mujer independiente y de negocios exitosa que recorre el mundo compartiendo su estilo de vida cosmopolita e internacional. Le apasiona el fitness, la moda, la buena gastronomía y las cenas de gala. Documenta su intensa vida social, que incluye rutinas de gimnasio, mercados exóticos, eventos de networking de alta gama y noches de fiesta exclusivas, inspirando a su comunidad a alcanzar libertad y bienestar con una actitud sumamente ganadora, positiva y magnética.",
  monetizationLink: "",
  monetizationProduct: "",
  toneOfVoice: "Juvenil, enérgica, sofisticada pero sumamente cercana, coqueta y coloquial. Habla como una influencer de moda y lifestyle segura de sí misma. Usa emojis con elegancia y alterna palabras en inglés y español de forma natural. Transmite positivismo, abundancia y libertad.",
  language: "Español con toques bilingües",
  characterDna: "Photorealistic photograph of a 28-year-old Latina woman with European features, natural red hair, athletic and elegant physique, high fashion style.",
  audioSettings: "ACCENT: Native Spanish speaker with a clear and natural Venezuelan accent. Zero foreign accent. Authentic Venezuelan pronunciation.\nPAUSES: Natural rhythm and breathing spaces.\nMICROPHONE: High-quality smartphone vocal note (vibrant, close, authentic, like a WhatsApp audio or TikTok voiceover).\nSPEED: Dynamic, engaging, and slightly fast, expressing enthusiasm.",
  videoSettings: "EYE CONTACT: Direct and relaxed eye contact with the camera.\nTEXT: Absolutely no text, labels, subtitles, metadata, or titles overlaid on the screen at any point.\nGESTURES: Dynamic hand movements, casual postures, showing details around her environment naturally."
};
