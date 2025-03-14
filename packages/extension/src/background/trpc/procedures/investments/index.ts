import { router } from "../../trpc"
import { getAllInvestmentsProcedure } from "./getAllInvestments"
import { getStrkDelegatedStakingInvestmentsProcedure } from "./getStrkDelegatedStakingInvestments"
import { getStrkLiquidStakingInvestmentsProcedure } from "./getStrkLiquidStakingInvestments"

export const investmentsRouter = router({
  getAllInvestments: getAllInvestmentsProcedure,
  getStrkDelegatedStakingInvestments:
    getStrkDelegatedStakingInvestmentsProcedure,
  getStrkLiquidStakingInvestments: getStrkLiquidStakingInvestmentsProcedure,
})
