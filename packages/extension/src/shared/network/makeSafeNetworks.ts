import { Address } from "@argent/x-shared"
import type { Network } from "./type"
import { ETH_TOKEN_ADDRESS } from "./constants"
import { networkSchema } from "."
import { isEmpty } from "lodash-es"

export const makeSafeNetworks = (unsafeNetworks: Network[]): Network[] => {
  return unsafeNetworks.flatMap((unsafeNetwork) => {
    if (networkSchema.safeParse(unsafeNetwork).success) {
      return [unsafeNetwork]
    }
    // try to fix the network if it is using old `feeTokenAddress` shape
    if (isEmpty(unsafeNetwork.possibleFeeTokenAddresses)) {
      // move feeTokenAddress -> possibleFeeTokenAddresses[feeTokenAddress]
      if (
        "feeTokenAddress" in unsafeNetwork &&
        !isEmpty(unsafeNetwork.feeTokenAddress)
      ) {
        unsafeNetwork.possibleFeeTokenAddresses = [
          unsafeNetwork.feeTokenAddress as Address,
        ]
        delete unsafeNetwork.feeTokenAddress
        if (networkSchema.safeParse(unsafeNetwork).success) {
          return [unsafeNetwork]
        }
      }
      // try possibleFeeTokenAddresses[ETH_TOKEN_ADDRESS]
      unsafeNetwork.possibleFeeTokenAddresses = [ETH_TOKEN_ADDRESS]
      if (networkSchema.safeParse(unsafeNetwork).success) {
        return [unsafeNetwork]
      }
    }
    // omit network that failed schema
    return []
  })
}
