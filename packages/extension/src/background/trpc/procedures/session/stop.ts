import { extensionOnlyProcedure } from "../permissions"
import { respond } from "../../../respond"

export const stopProcedure = extensionOnlyProcedure.mutation(
  async ({
    ctx: {
      services: { wallet },
    },
  }) => {
    void wallet.lock()
    return respond({ type: "DISCONNECT_ACCOUNT" })
  },
)
