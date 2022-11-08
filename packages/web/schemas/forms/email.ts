import * as z from "zod"

import { emailSchema } from "../primitives/email"

export const enterEmailFormSchema = z
  .object({
    email: emailSchema,
  })
  .required()
