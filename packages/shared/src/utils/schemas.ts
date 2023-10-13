import { z } from "zod"
export const booleanToStringSchema = z
  .boolean()
  .transform((bool) => String(bool))
export const stringToBooleanSchema = z
  .string()
  .transform((string) => string === "true")
