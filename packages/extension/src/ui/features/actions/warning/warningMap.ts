import type { z } from "zod"
import type { severitySchema } from "@argent/x-shared/simulation"

export const riskToColorSchemeMap: Record<
  z.infer<typeof severitySchema>,
  string
> = {
  info: "info",
  caution: "warning",
  high: "danger",
  critical: "danger",
}

export const riskToHeaderMap: Record<z.infer<typeof severitySchema>, string> = {
  info: "Double check",
  caution: "Caution",
  high: "High risk",
  critical: "Critical risk",
}

export const riskToBadgeMap: Record<z.infer<typeof severitySchema>, string> = {
  info: "Info",
  caution: "Caution",
  high: "High risk",
  critical: "Critical risk",
}
