import { z } from "zod"

export const argentNameSchema = z
  .string()
  .regex(/^([a-zA-Z0-9-]+\.)+argent.xyz$/, "Invalid Argent name")
  .max(253, "Argent name cannot be over 253 characters")

export type ArgentName = z.infer<typeof argentNameSchema>

export const isArgentName = (argentName?: string): argentName is ArgentName => {
  return argentNameSchema.safeParse(argentName).success
}

export const isEqualArgentName = (a: string, b?: string) => {
  try {
    if (!b) {
      return false
    }
    return normalizeArgentName(a) === normalizeArgentName(b)
  } catch {
    // ignore parsing error
  }
  return false
}

export const normalizeArgentName = (argentName: ArgentName) => {
  return argentNameSchema.parse(argentName).toLowerCase()
}
