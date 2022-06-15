import { Call, validateAndParseAddress } from "starknet"

import { normalizeAddress } from "../ui/services/addresses"
import { isValidInputAmount } from "./token"

export interface Erc20TransferCall extends Call {
  calldata: [
    /** recipient address as decimal e.g. 2007141710004580612847837172790366058109710402280793820610123055421682225678 */
    recipientAddressDecimal: string,
    /** amount e.g. 10000000000000 */
    amount: string,
    /** padding, always zero? */
    _: string,
  ]
}

/**
 * Checks if the call has the expected shape of an ERC20 transfer call
 * @param call Call
 * @returns true if the call passes validation
 */

export const isErc20TransferCall = (call: Call): boolean => {
  try {
    if (
      call &&
      call.contractAddress &&
      call.entrypoint === "transfer" &&
      call.calldata?.length === 3
    ) {
      /** validate token address */
      validateAndParseAddress(call.contractAddress)
      /** validate recipient address */
      validateAndParseAddress(call.calldata[0])
      /** validate uint256 input amount */
      if (isValidInputAmount(call.calldata[1])) {
        return true
      }
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}

/**
 * Parses an ERC20 transfer call
 * @param call Erc20TransferCall
 */

export const parseErc20TransferCall = (call: Erc20TransferCall) => {
  if (!isErc20TransferCall(call)) {
    throw "Invalid call"
  }
  const { contractAddress, calldata } = call
  const [recipientAddressDecimal, amount] = calldata
  const recipientAddress = normalizeAddress(recipientAddressDecimal)
  return {
    contractAddress,
    recipientAddress,
    amount,
  }
}
