import { router } from "../../trpc"
import { declareContractProcedure } from "./declareContractProcedure"
import { deployContractProcedure } from "./deployContractProcedure"
import { getConstructorParamsProcedure } from "./getConstructorParams"

export const udcRouter = router({
  getConstructorParams: getConstructorParamsProcedure,
  deployContract: deployContractProcedure,
  declareContract: declareContractProcedure,
})
