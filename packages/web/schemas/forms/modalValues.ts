import * as z from "zod"

import { emailSchema } from "../primitives/email"

export const modalValuesSchema = z
  .object({
    loggedIn: z.literal(true),
    email: emailSchema,
  })
  .required()
  .or(
    z
      .object({
        loggedIn: z.literal(false),
      })
      .required(),
  )
