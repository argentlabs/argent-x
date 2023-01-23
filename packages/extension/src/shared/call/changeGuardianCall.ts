import { Call, validateAndParseAddress } from "starknet"

export interface ChangeGuardianCall extends Call {
  entrypoint: "changeGuardian"
}

export const isChangeGuardianCall = (
  call: Call,
): call is ChangeGuardianCall => {
  try {
    if (call.contractAddress && call.entrypoint === "changeGuardian") {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}
