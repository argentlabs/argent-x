import { extensionOnlyProcedure } from "../permissions"

export const getStrkDelegatedStakingInvestmentsProcedure =
  extensionOnlyProcedure.query(
    async ({
      ctx: {
        services: { investmentService },
      },
    }) => {
      return await investmentService.getStrkDelegatedStakingInvestments()
    },
  )
