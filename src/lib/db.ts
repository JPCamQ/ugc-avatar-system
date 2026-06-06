// Módulo de base de datos en localStorage para el Ecosistema Multi-Avatar UGC

export interface AvatarIdentity {
  id: string; // ID único
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
  avatarImage?: string; // Almacenará la imagen en base64
}

export type GrowthPhase = "storytelling" | "value" | "conversion";

export interface PostIdea {
  id: string;
  avatarId: string; // Clave foránea para asociar al avatar correspondiente
  title: string;
  type: "image" | "carousel" | "video";
  location: string;
  phase: GrowthPhase; // Fase a la que pertenece esta publicación
  scenePrompt: string;
  formattedFlowPrompt: string;
  instagramCaption: string;
  status: "draft" | "generated" | "published";
  createdAt: string;
  productImage?: string; // Imagen del producto de afiliados en base64
  productName?: string;  // Nombre del producto/marca de afiliados
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

// Configuración inicial del primer avatar: Valeria Cruz
export const DEFAULT_AVATAR: AvatarIdentity = {
  id: "valeria_cruz",
  name: "Valeria Cruz",
  age: 28,
  niche: "Lifestyle Financiero & Viajes Sola",
  location: "Medellín, Colombia (actualmente viajando)",
  backstory: "Nacida en Bogotá. A los 25 años estaba sumida en deudas trabajando 10 horas al día en un cubículo de oficina. Decidió aprender sobre finanzas personales, inversiones digitales y marketing de afiliados. Hoy, a sus 28, es financieramente libre, viaja sola documentando su camino y enseña a otros hispanos a construir riqueza desde cero a través de herramientas fintech y marca personal vendible.",
  monetizationLink: "https://fintech-afiliado.com/valeria-cruz",
  monetizationProduct: "Registro en plataforma Fintech (Cupo de Inversión + Bono de $20 USD)",
  toneOfVoice: "Cercana, ultra natural, espontánea, coloquial y millennial. No suena a profesora de finanzas; habla como una amiga de confianza que te cuenta un truco sobre cómo viaja de forma inteligente. Usa emojis de forma sutil, responde de forma relajada e informal pero con convicción y transparencia.",
  language: "Español Latinoamericano",
  characterDna: "Photorealistic photograph of a 28-year-old Latina woman with European features and red hair.",
  audioSettings: "ACCENT: Warm and friendly neutral Latin American Spanish, conversational and modern diction.\nPAUSES: Relaxed and expressive rhythm, breathing naturally.\nMICROPHONE: Simulate high-quality smartphone vocal note (vibrant, close, authentic, like a WhatsApp audio or TikTok voiceover).\nSPEED: Dynamic, engaging, and slightly fast, expressing enthusiasm.",
  videoSettings: "EYE CONTACT: Direct but playful and relaxed eye contact with the camera, resembling a smartphone selfie video.\nMICRO-EXPRESSIONS: Smiling, warm expressions, organic winks, natural laughter.\nGESTURES: Dynamic hand movements, casual postures, showing details around her environment naturally."
};
