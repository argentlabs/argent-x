import { Call, validateAndParseAddress } from "starknet"
import { MultisigEntryPointType } from "../multisig/types"

export interface AddMultisigSignersCall extends Call {
  entrypoint: MultisigEntryPointType.ADD_SIGNERS
}

export const isAddMultisigSignersCall = (
  call: Call,
): call is AddMultisigSignersCall => {
  try {
    if (
      call.contractAddress &&
      call.entrypoint === MultisigEntryPointType.ADD_SIGNERS
    ) {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}

export interface RemoveMultisigSignersCall extends Call {
  entrypoint: MultisigEntryPointType.REMOVE_SIGNERS
}

export const isRemoveMultisigSignersCall = (
  call: Call,
): call is RemoveMultisigSignersCall => {
  try {
    if (
      call.contractAddress &&
      call.entrypoint === MultisigEntryPointType.REMOVE_SIGNERS
    ) {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}

export interface ReplaceMultisigSignerCall extends Call {
  entrypoint: MultisigEntryPointType.REPLACE_SIGNER
}

export const isReplaceMultisigSignerCall = (
  call: Call,
): call is RemoveMultisigSignersCall => {
  try {
    if (
      call.contractAddress &&
      call.entrypoint === MultisigEntryPointType.REPLACE_SIGNER
    ) {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}
