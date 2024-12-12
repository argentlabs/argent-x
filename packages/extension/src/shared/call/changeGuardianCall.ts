import type { Call } from "starknet"
import { validateAndParseAddress } from "starknet"

export interface ChangeGuardianCall extends Call {
  entrypoint: "changeGuardian" | "change_guardian"
}

export const isChangeGuardianCall = (
  call: Call,
): call is ChangeGuardianCall => {
  try {
    if (
      call.contractAddress &&
      ["changeGuardian", "change_guardian"].includes(call.entrypoint)
    ) {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch {
    // failure implies invalid
  }
  return false
}
