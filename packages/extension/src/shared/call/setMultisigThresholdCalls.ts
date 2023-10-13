import { Call, validateAndParseAddress } from "starknet"
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
  } catch (e) {
    // failure implies invalid
  }
  return false
}
