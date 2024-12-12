import type { Address } from "@argent/x-shared"
import { addressSchema, isEqualAddress } from "@argent/x-shared"
import type { Call } from "starknet"
import { CallData, num, validateAndParseAddress } from "starknet"
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
  } catch {
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
  } catch {
    // failure implies invalid
  }
  return false
}

export interface ReplaceMultisigSignerCall extends Call {
  entrypoint: MultisigEntryPointType.REPLACE_SIGNER
}

export const isReplaceMultisigSignerCall = (
  call: Call,
): call is ReplaceMultisigSignerCall => {
  try {
    if (
      call.contractAddress &&
      call.entrypoint === MultisigEntryPointType.REPLACE_SIGNER
    ) {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch {
    // failure implies invalid
  }
  return false
}

export const isReplaceSelfAsSignerInMultisigCall = (
  call: Call,
  selfPubKey: string,
): call is ReplaceMultisigSignerCall => {
  try {
    if (
      call.contractAddress &&
      call.entrypoint === MultisigEntryPointType.REPLACE_SIGNER
    ) {
      const calldata = CallData.toCalldata(call.calldata)
      const replacedPubKey = addressSchema.parse(num.toHex(calldata[0]))
      return calldata.length === 2 && isEqualAddress(replacedPubKey, selfPubKey)
    }
  } catch {
    // failure implies invalid
  }
  return false
}

export const getNewSignerInReplaceMultisigSignerCall = (
  call: ReplaceMultisigSignerCall,
): Address | undefined => {
  if (!isReplaceMultisigSignerCall(call)) {
    return
  }
  const calldata = CallData.toCalldata(call.calldata)
  if (calldata.length !== 2) {
    return
  }
  const newPubKey = addressSchema.parse(num.toHex(calldata[1]))
  return newPubKey
}
