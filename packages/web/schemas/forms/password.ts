import * as z from "zod"

import { passwordSchema } from "../primitives/password"

export const setPasswordFormSchema = z
  .object({
    password: passwordSchema,
    repeatPassword: passwordSchema,
  })
  .required()
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  })

export const enterPasswordFormSchema = z
  .object({
    password: passwordSchema,
  })
  .required()
