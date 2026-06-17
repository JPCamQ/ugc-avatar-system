import { z } from "zod";
import { avatarIdentitySchema } from "./avatar";
import { postIdeaSchema } from "./idea";

export const chatMessageSchema = z.object({
  id: z.string().min(1, "El ID del mensaje es requerido"),
  sender: z.enum(["user", "avatar"]),
  text: z.string().min(1, "El texto del mensaje no puede estar vacío"),
  timestamp: z.string().min(1, "La marca de tiempo es requerida"),
});

export const captionRequestSchema = z.object({
  avatar: avatarIdentitySchema,
  idea: postIdeaSchema,
  apiKey: z.string().optional(),
});

export const chatRequestSchema = z.object({
  avatar: avatarIdentitySchema,
  messages: z.array(chatMessageSchema).min(1, "Debe haber al menos un mensaje"),
  apiKey: z.string().optional(),
});

export const promptRequestSchema = z.object({
  avatar: avatarIdentitySchema,
  idea: postIdeaSchema,
  audioLanguage: z.enum(["es", "en", "silent", "voiceover"]).optional(),
  apiKey: z.string().optional(),
});

export const expandAvatarRequestSchema = z.object({
  gender: z.string().min(1, "El género es requerido"),
  niche: z.string().min(3, "El nicho es requerido"),
  location: z.string().min(3, "La ubicación es requerida"),
  bodyType: z.string().min(1, "El tipo de cuerpo es requerido"),
  apiKey: z.string().optional(),
});
