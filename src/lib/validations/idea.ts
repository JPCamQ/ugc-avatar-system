import { z } from "zod";

export const postIdeaSchema = z.object({
  id: z.string().optional(),
  avatarId: z.string().min(1, "El ID del avatar es requerido"),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  type: z.enum(["image", "carousel", "video", "flyer"]),
  location: z.string().max(200).optional().or(z.literal("")),
  phase: z.enum(["storytelling", "value", "conversion"]).optional().default("storytelling"),
  scenePrompt: z.string().optional().or(z.literal("")),
  formattedFlowPrompt: z.string().optional().or(z.literal("")),
  instagramCaption: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "generated", "published"]).optional().default("draft"),
  productImage: z.string().optional().nullable(),
  productName: z.string().max(200).optional().or(z.literal("")),
  promptStyle: z.enum(["ugc", "editorial"]).optional().default("ugc"),
});
