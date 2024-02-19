import { z } from "zod"

export const statusSchema = z.union([
  z.literal("notActive"),
  z.literal("eligibilityCheck"),
  z.literal("active"),
  z.literal("paused"),
  z.literal("disabled"),
])

export const provisionStatusSchema = z.object({
  status: statusSchema,
  link: z.string().optional(),
  bannerTitle: z.string(),
  bannerDescription: z.string(),
})

export type ProvisionStatus = z.infer<typeof provisionStatusSchema>
export type Status = z.infer<typeof statusSchema>
