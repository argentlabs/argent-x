import { Call, constants, validateAndParseAddress } from "starknet"

import { isEqualAddress } from "../../ui/services/addresses"

const { UDC } = constants

export interface UdcDeclareCall extends Call {
  entrypoint: "declareContract"
}

export const isUdcDeclareCall = (call: Call): call is UdcDeclareCall => {
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
