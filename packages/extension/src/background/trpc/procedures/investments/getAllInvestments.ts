import { extensionOnlyProcedure } from "../permissions"

export const getAllInvestmentsProcedure = extensionOnlyProcedure.query(
  async ({
    ctx: {
      services: { investmentService },
    },
  }) => {
    return await investmentService.getAllInvestments()
  },
)
