import { extensionOnlyProcedure } from "../permissions"

export const clearErrorRecoveringProcedure = extensionOnlyProcedure.mutation(
  async ({
    ctx: {
      services: { recoveryService },
    },
  }) => {
    return recoveryService.clearErrorRecovering()
  },
)
