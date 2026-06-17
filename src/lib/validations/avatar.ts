import { z } from "zod";

export const newAvatarInputSchema = z.object({
  gender: z.string().min(1, "El género es requerido"),
  niche: z.string().min(3, "El nicho debe tener al menos 3 caracteres"),
  location: z.string().min(3, "La ubicación debe tener al menos 3 caracteres"),
  bodyType: z.string().min(1, "El tipo de cuerpo es requerido"),
});

export const avatarIdentitySchema = z.object({
  id: z.string().min(1, "El ID es requerido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  age: z.coerce.number().int().min(18, "La edad mínima es 18").max(100, "La edad máxima es 100"),
  niche: z.string().min(3, "El nicho debe tener al menos 3 caracteres"),
  location: z.string().min(3, "La ubicación debe tener al menos 3 caracteres"),
  backstory: z.string().min(10, "La historia de fondo debe tener al menos 10 caracteres"),
  monetizationLink: z.string().max(500).default(""),
  monetizationProduct: z.string().max(200).default(""),
  toneOfVoice: z.string().min(5, "El tono de voz debe tener al menos 5 caracteres"),
  language: z.string().min(2, "El idioma debe tener al menos 2 caracteres"),
  characterDna: z.string().min(10, "El DNA del personaje debe tener al menos 10 caracteres"),
  audioSettings: z.string().min(5, "La configuración de audio debe tener al menos 5 caracteres"),
  videoSettings: z.string().min(5, "La configuración de video debe tener al menos 5 caracteres"),
  avatarImage: z.string().optional().nullable(),
  gender: z.string().optional(),
  bodyType: z.string().optional(),
  instagramAccessToken: z.string().optional().nullable(),
  instagramUserId: z.string().optional().nullable(),
  instagramUserName: z.string().optional().nullable(),
});

export const avatarUpdateSchema = avatarIdentitySchema.partial().omit({ id: true });
