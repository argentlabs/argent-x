import { extensionOnlyProcedure } from "../permissions"

export const getStrkLiquidStakingInvestmentsProcedure =
  extensionOnlyProcedure.query(
    async ({
      ctx: {
        services: { investmentService },
      },
    }) => {
      return await investmentService.getStrkLiquidStakingInvestments()
    },
  )
