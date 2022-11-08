import * as z from "zod"

import { passwordSchema } from "../primitives/password"

export const createPasswordFormSchema = z
  .object({
    password: passwordSchema,
  })
  .required()
