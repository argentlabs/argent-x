import { extensionOnlyProcedure } from "../permissions"
import { strkStakingCalldataSchema } from "@argent/x-shared"

export const stakeCalldataProcedure = extensionOnlyProcedure
  .input(strkStakingCalldataSchema)
  .query(
    async ({
      input,
      ctx: {
        services: { stakingService },
      },
    }) => {
      return await stakingService.getStakeCalldata(input)
    },
  )
