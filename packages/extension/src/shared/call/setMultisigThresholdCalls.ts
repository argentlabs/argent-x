import type { Call } from "starknet"
import { validateAndParseAddress } from "starknet"
import { MultisigEntryPointType } from "../multisig/types"

export interface ChangeTresholdMultisigCall extends Call {
  entrypoint: MultisigEntryPointType.CHANGE_THRESHOLD
}

export const isChangeTresholdMultisigCall = (
  call: Call,
): call is ChangeTresholdMultisigCall => {
  try {
    if (
      call.contractAddress &&
      call.entrypoint === MultisigEntryPointType.CHANGE_THRESHOLD
    ) {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch {
    // failure implies invalid
  }
  return false
}
