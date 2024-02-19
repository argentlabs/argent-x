import { z } from "zod"

export const newsItemSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  created: z.string().optional(),
  modified: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  badgeText: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  dappId: z.string().optional(),
})

export const newsApiReponseSchema = z.object({
  lastModified: z.string(),
  news: z.array(newsItemSchema),
})

export type NewsItem = z.infer<typeof newsItemSchema>

export type NewsApiReponse = z.infer<typeof newsApiReponseSchema>
