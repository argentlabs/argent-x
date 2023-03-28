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
