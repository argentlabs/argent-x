import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { resetDevice } from "../../../../shared/smartAccount/jwt"
import { ampli } from "../../../../shared/analytics"
import { idb } from "../../../../shared/smartAccount/idb"
import * as amplitude from "@amplitude/analytics-browser"

export const logoutProcedure = extensionOnlyProcedure
  .output(z.void())
  .mutation(async () => {
    try {
      await idb.ids.delete("userId")

      const amplitudeIdentify = new amplitude.Identify()
      ampli.client.identify(amplitudeIdentify, { user_id: "" })
      await resetDevice()
    } catch (error) {
      throw new Error("Error while logging out", { cause: error })
    }
  })
