import { z } from "zod"

export const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const flowSchema = z
  .enum(["shield", "argentAccount", "emailPreferences"])
  .default("shield")

export type Flow = z.infer<typeof flowSchema>

export interface ArgentAccountBaseEmailScreenProps {
  onBack?: () => void
  onCancel?: () => void
  onEmailRequested: (email: string) => void
  flow: Flow
}
