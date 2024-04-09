import { normalizeAddress } from "@argent/x-shared"
import { Call, CallData, num, uint256, validateAndParseAddress } from "starknet"

const { uint256ToBN } = uint256

export interface NftTransferCall extends Call {
  calldata: [
    // fromAddress as decimal e.g. 2007141710004580612847837172790366058109710402280793820610123055421682225678
    string,
    // toAddress as decimal e.g. 2007141710004580612847837172790366058109710402280793820610123055421682225678
    string,
    // tokenId as 2-part low and high felt
    num.BigNumberish,
    num.BigNumberish,
  ]
  entrypoint: "safeTransferFrom" | "transferFrom"
}

export const isNftTransferCall = (call: Call): call is NftTransferCall => {
  try {
    if (
      call.contractAddress &&
      (call.entrypoint === "transferFrom" ||
        call.entrypoint === "safeTransferFrom") &&
      call.calldata?.length === 4
    ) {
      const { contractAddress, calldata } = call
      validateAndParseAddress(contractAddress)
      const [
        fromAddressDecimal,
        toAddressDecimal,
        tokenIdLowFelt,
        tokenIdHighFelt,
      ] = CallData.compile(calldata)
      validateAndParseAddress(fromAddressDecimal)
      validateAndParseAddress(toAddressDecimal)
      const tokenIdUnit256: uint256.Uint256 = {
        low: tokenIdLowFelt,
        high: tokenIdHighFelt,
      }
      const tokenId = uint256ToBN(tokenIdUnit256)
      return tokenId !== undefined
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}

export const parseNftTransferCall = (call: NftTransferCall) => {
  const { contractAddress, calldata } = call
  const [
    fromAddressDecimal,
    toAddressDecimal,
    tokenIdLowFelt,
    tokenIdHighFelt,
  ] = calldata
  const fromAddress = normalizeAddress(fromAddressDecimal)
  const toAddress = normalizeAddress(toAddressDecimal)
  const tokenIdUnit256: uint256.Uint256 = {
    low: tokenIdLowFelt,
    high: tokenIdHighFelt,
  }
  const tokenId = uint256ToBN(tokenIdUnit256).toString(10)
  return {
    contractAddress,
    fromAddress,
    toAddress,
    tokenId,
  }
}
