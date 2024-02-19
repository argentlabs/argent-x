import { addressSchema } from "@argent/shared"
import { extensionOnlyProcedure } from "../permissions"

export const preferFeeTokenProcedure = extensionOnlyProcedure
  .input(addressSchema)
  .mutation(
    ({
      input: feeTokenAddress,
      ctx: {
        services: { feeTokenService },
      },
    }) => {
      return feeTokenService.preferFeeToken(feeTokenAddress)
    },
  )
