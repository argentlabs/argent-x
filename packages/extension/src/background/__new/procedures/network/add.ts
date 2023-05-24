import { addNetwork, networkSchema } from "../../../../shared/network"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const addNetworkProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(networkSchema)
  .mutation(async ({ input }) => {
    await addNetwork(input)
    return true
  })
