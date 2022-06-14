import { Call, validateAndParseAddress } from "starknet"

import { isValidInputAmount } from "./token"

export const isERC20TransferCall = (transaction: Call): boolean => {
  try {
    if (
      transaction &&
      transaction.contractAddress &&
      transaction.entrypoint === "transfer" &&
      transaction.calldata?.length === 3
    ) {
      /** validate token address */
      validateAndParseAddress(transaction.contractAddress)
      /** validate recipient address */
      validateAndParseAddress(transaction.calldata[0])
      /** validate uint256 input amount */
      if (isValidInputAmount(transaction.calldata[1])) {
        return true
      }
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}
