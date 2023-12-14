import { z } from "zod"
import { parseUnits } from "./parseUnits"
export function createUnitsSchema(decimals: number) {
  return z
    .string()
    .refine(
      (value) => {
        const numberPattern = /^-?\d+(\.\d+)?$/
        return numberPattern.test(value)
      },
      { message: "Invalid number format" },
    )
    .transform((value) => parseUnits(value, decimals))
}
