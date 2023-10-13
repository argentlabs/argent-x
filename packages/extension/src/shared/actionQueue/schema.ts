import { z } from "zod"

export const actionHashSchema = z.string()

export type ActionHash = z.infer<typeof actionHashSchema>

export const actionQueueItemMetaSchema = z.object({
  hash: actionHashSchema,
  expires: z.number(),
  origin: z.string().url().optional(),
  startedApproving: z.number().optional(),
  errorApproving: z.string().optional(),
})

export type ActionQueueItemMeta = z.infer<typeof actionQueueItemMetaSchema>

export const actionQueueItemSchema = z.object({
  meta: actionQueueItemMetaSchema,
})

export type ActionQueueItem = z.infer<typeof actionQueueItemSchema>
