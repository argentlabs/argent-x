import { extensionOnlyProcedure } from "../permissions"

export const removeGuardianProcedure = extensionOnlyProcedure.mutation(
  async ({
    ctx: {
      services: { argentAccountService },
    },
  }) => {
    await argentAccountService.removeGuardian()
  },
)
