import { Call, validateAndParseAddress } from "starknet"

export interface ChangeTresholdMultisigCall extends Call {
  entrypoint: "changeThreshold"
}

export const isChangeTresholdMultisigCall = (
  call: Call,
): call is ChangeTresholdMultisigCall => {
  try {
    if (call.contractAddress && call.entrypoint === "changeThreshold") {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}
