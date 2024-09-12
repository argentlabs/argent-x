import { isEqualAddress } from "@argent/x-shared"
import {
  Call,
  constants,
  uint256,
  validateAndParseAddress,
  num,
} from "starknet"
import { ETH_TOKEN_ADDRESS } from "../network/constants"
import { Erc20Call } from "./erc20Call"
import { Erc20TransferCall } from "./erc20TransferCall"
const { isUint256, uint256ToBN } = uint256

/**
 * The reject on chain call is actually a 0 ETH transfer to the same account
 * So we need to check if the call is a valid ERC20 transfer call, the recipient is the same address as the sender and the amount is 0
 */
export const isRejectOnChainCall = (
  call: Call,
  senderAddress: string,
): call is Erc20TransferCall => {
  try {
    if (
      call.contractAddress &&
      call.entrypoint === "transfer" &&
      call.calldata?.length === 3
    ) {
      return validateRejectOnChainCall(call as Erc20TransferCall, senderAddress)
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}

export const validateRejectOnChainCall = (
  call: Erc20Call,
  senderAddress: string,
) => {
  try {
    const { contractAddress, calldata } = call
    /** validate token address */
    const tokenAddress = validateAndParseAddress(contractAddress)
    if (!isEqualAddress(tokenAddress, ETH_TOKEN_ADDRESS)) {
      return false
    }
    /** validate recipient address */
    const [recipientAddressDecimal, amountLowFelt, amountHighFelt] = calldata
    const recipient = validateAndParseAddress(
      num.toHex(recipientAddressDecimal),
    )

    if (!isEqualAddress(senderAddress, recipient)) {
      return false
    }

    /** validate uint256 input amount */
    const amount = uint256ToBN({
      low: amountLowFelt,
      high: amountHighFelt,
    })
    /** final check for valid Unit256 that is 0 */
    if (isUint256(amount) && amount === constants.ZERO) {
      return true
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}
