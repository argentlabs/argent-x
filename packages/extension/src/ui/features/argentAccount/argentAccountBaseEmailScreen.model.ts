import { z } from "zod"
import type { Flow } from "../../../shared/argentAccount/schema"

export const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export interface ArgentAccountBaseEmailScreenProps {
  onBack?: () => void
  onCancel?: () => void
  onEmailRequested: (email: string) => void
  flow: Flow
}
