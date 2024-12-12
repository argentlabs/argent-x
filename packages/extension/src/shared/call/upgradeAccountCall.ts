import type { Address } from "@argent/x-shared"
import { addressSchema } from "@argent/x-shared"
import type { Call } from "starknet"
import { validateAndParseAddress } from "starknet"
import { MultisigEntryPointType } from "../multisig/types"

export interface UpgradeAccountCall extends Call {
  entrypoint: "upgrade"
}

export const isUpgradeAccountCall = (
  call: Call,
): call is UpgradeAccountCall => {
  try {
    if (
      call.contractAddress &&
      call.entrypoint === MultisigEntryPointType.UPGRADE
    ) {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch {
    // failure implies invalid
  }
  return false
}

export const extractNewClassHash = (
  call: UpgradeAccountCall,
): Address | undefined => {
  if (Array.isArray(call.calldata)) {
    return addressSchema.safeParse(call.calldata[0]?.toString()).data
  }
}
