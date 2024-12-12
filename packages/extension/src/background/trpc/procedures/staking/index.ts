import { router } from "../../trpc"
import { claimProcedure } from "./claim"
import { initiateUnstakeProcedure } from "./initiateUnstake"
import { stakeProcedure } from "./stake"
import { unstakeProcedure } from "./unstake"
import { stakeCalldataProcedure } from "./stakeCalldata"

export const stakingRouter = router({
  stake: stakeProcedure,
  stakeCalldata: stakeCalldataProcedure,
  claim: claimProcedure,
  initiateUnstake: initiateUnstakeProcedure,
  unstake: unstakeProcedure,
})
