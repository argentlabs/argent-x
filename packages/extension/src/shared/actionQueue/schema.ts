import { z } from "zod"
import { icons } from "@argent/ui"

export const actionHashSchema = z.string()
export type ActionHash = z.infer<typeof actionHashSchema>

/** This dance converts Object.keys into z.enum */
const [first, ...rest] = Object.keys(icons) as (keyof typeof icons)[]
const allIconKeysSchema = z.enum([first, ...rest])
export type AllIconKeys = z.infer<typeof allIconKeysSchema>

export const actionQueueItemMetaSchema = z.object({
  hash: actionHashSchema,
  expires: z.number(),
  origin: z.string().url().optional(),
  startedApproving: z.number().optional(),
  errorApproving: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  icon: allIconKeysSchema.optional(),
})

export type ActionQueueItemMeta = z.infer<typeof actionQueueItemMetaSchema>

export const actionQueueItemSchema = z.object({
  meta: actionQueueItemMetaSchema,
})

export type ActionQueueItem = z.infer<typeof actionQueueItemSchema>
