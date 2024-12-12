import type { Call } from "starknet"

import type { Erc20Call } from "./erc20Call"
import { parseErc20Call, validateERC20Call } from "./erc20Call"

export interface Erc20ApproveCall extends Erc20Call {
  entrypoint: "approve"
}

/**
 * Checks if the call has the expected shape of an ERC20 approve call
 * @param call Call
 * @returns true if the call passes validation
 */

export const isErc20ApproveCall = (call: Call): call is Erc20ApproveCall => {
  try {
    if (
      call &&
      call.contractAddress &&
      call.entrypoint === "approve" &&
      call.calldata?.length === 3
    ) {
      return validateERC20Call(call as Erc20ApproveCall)
    }
  } catch {
    // failure implies invalid
  }
  return false
}

/**
 * Parses an ERC20 approve call
 * @param call Erc20ApproveCall
 */

export const parseErc20ApproveCall = (call: Erc20ApproveCall) => {
  if (!isErc20ApproveCall(call)) {
    throw "Invalid call"
  }
  return parseErc20Call(call)
}
