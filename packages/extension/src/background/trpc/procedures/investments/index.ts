import { router } from "../../trpc"
import { getAllInvestmentsProcedure } from "./getAllInvestments"
import { getStrkDelegatedStakingInvestmentsProcedure } from "./getStrkDelegatedStakingInvestments"

export const investmentsRouter = router({
  getAllInvestments: getAllInvestmentsProcedure,
  getStrkDelegatedStakingInvestments:
    getStrkDelegatedStakingInvestmentsProcedure,
})
