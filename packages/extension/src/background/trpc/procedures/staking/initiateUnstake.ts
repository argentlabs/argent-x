import { extensionOnlyProcedure } from "../permissions"
import { strkStakingCalldataWithAccountTypeSchema } from "../../../../shared/staking/types"

export const initiateUnstakeProcedure = extensionOnlyProcedure
  .input(strkStakingCalldataWithAccountTypeSchema)
  .mutation(
    async ({
      input,
      ctx: {
        services: { stakingService },
      },
    }) => {
      return await stakingService.initiateUnstake(input)
    },
  )
