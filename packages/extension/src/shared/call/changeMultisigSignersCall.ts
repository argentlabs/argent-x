import { Call, validateAndParseAddress } from "starknet"

export interface AddMultisigSignersCall extends Call {
  entrypoint: "addSigners"
}

export const isAddMultisigSignersCall = (
  call: Call,
): call is AddMultisigSignersCall => {
  try {
    if (call.contractAddress && call.entrypoint === "addSigners") {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}

export interface RemoveMultisigSignersCall extends Call {
  entrypoint: "removeSigners"
}

export const isRemoveMultisigSignersCall = (
  call: Call,
): call is AddMultisigSignersCall => {
  try {
    if (call.contractAddress && call.entrypoint === "removeSigners") {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}
