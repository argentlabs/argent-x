import { isEqualAddress } from "@argent/x-shared"
import { Call, constants, validateAndParseAddress } from "starknet"

const { UDC } = constants

export interface UdcDeployCall extends Call {
  entrypoint: "deployContract"
}

export const isUdcDeployCall = (call: Call): call is UdcDeployCall => {
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
