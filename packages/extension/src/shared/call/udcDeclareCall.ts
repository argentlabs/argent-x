import { Call, constants, validateAndParseAddress } from "starknet"

import { isEqualAddress } from "../../ui/services/addresses"

const { UDC } = constants

export const isUdcDeclareCall = (call: Call): call is Call => {
  try {
    if (
      call.contractAddress &&
      isEqualAddress(call.contractAddress, UDC.ADDRESS) &&
      call.entrypoint === "declareContract"
    ) {
      validateAndParseAddress(call.contractAddress)
      return true
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}
