import type { Call } from "starknet"

import type { Erc20Call } from "./erc20Call"
import { parseErc20Call, validateERC20Call } from "./erc20Call"

export interface Erc20MintCall extends Erc20Call {
  entrypoint: "mint"
}

export const isErc20MintCall = (call: Call): call is Erc20MintCall => {
  try {
    if (
      call.contractAddress &&
      call.entrypoint === "mint" &&
      call.calldata?.length === 3
    ) {
      return validateERC20Call(call as Erc20MintCall)
    }
  } catch {
    // failure implies invalid
  }
  return false
}

export const parseErc20MintCall = (call: Erc20MintCall) => {
  if (!isErc20MintCall(call)) {
    throw "Invalid call"
  }
  return parseErc20Call(call)
}
