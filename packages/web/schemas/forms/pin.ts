import * as z from "zod"

import { pinSchema } from "../primitives/pin"

export const confirmEmailPinForm = z
  .object({
    pin: pinSchema,
  })
  .required()
