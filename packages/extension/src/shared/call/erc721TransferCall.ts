import { Call, number, uint256, validateAndParseAddress } from "starknet"

import { normalizeAddress } from "../../ui/services/addresses"

const { uint256ToBN } = uint256

export interface Erc721TransferCall extends Call {
  calldata: [
    fromAddressDecimal: string,
    toAddressDecimal: string,
    tokenIdLowFelt: number.BigNumberish,
    tokenIdHighFelt: number.BigNumberish,
  ]
  entrypoint: "transferFrom"
}

export const isErc721TransferCall = (
  call: Call,
): call is Erc721TransferCall => {
  try {
    if (
      call.contractAddress &&
      call.entrypoint === "transferFrom" &&
      call.calldata?.length === 4
    ) {
      const { contractAddress, calldata } = call
      validateAndParseAddress(contractAddress)
      const [
        fromAddressDecimal,
        toAddressDecimal,
        tokenIdLowFelt,
        tokenIdHighFelt,
      ] = calldata
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

export const parseErc721TransferCall = (call: Erc721TransferCall) => {
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
