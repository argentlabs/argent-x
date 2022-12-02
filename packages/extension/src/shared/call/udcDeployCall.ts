import { Call, constants, validateAndParseAddress } from "starknet"

import { isEqualAddress } from "../../ui/services/addresses"

const { UDC } = constants

export const isUdcDeployCall = (call: Call): call is Call => {
  try {
    if (
      call.contractAddress &&
      isEqualAddress(call.contractAddress, UDC.ADDRESS) &&
      call.entrypoint === "deployContract"
    ) {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}
