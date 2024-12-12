import type { Call } from "starknet"

import type { Erc20Call } from "./erc20Call"
import { parseErc20Call, validateERC20Call } from "./erc20Call"

export interface Erc20TransferCall extends Erc20Call {
  entrypoint: "transfer"
}

/**
 * Checks if the call has the expected shape of an ERC20 transfer call
 * @param call Call
 * @returns true if the call passes validation
 */

export const isErc20TransferCall = (call: Call): call is Erc20TransferCall => {
  try {
    if (
      call.contractAddress &&
      call.entrypoint === "transfer" &&
      call.calldata?.length === 3
    ) {
      return validateERC20Call(call as Erc20TransferCall)
    }
  } catch {
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
  return parseErc20Call(call)
}
