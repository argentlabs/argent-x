import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { resetDevice } from "../../../../shared/shield/jwt"

export const logoutProcedure = extensionOnlyProcedure
  .output(z.void())
  .mutation(async () => {
    try {
      await resetDevice()
    } catch (error) {
      throw new Error("Error while logging out", { cause: error })
    }
  })
