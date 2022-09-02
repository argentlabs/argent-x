import { Call, validateAndParseAddress } from "starknet"
import { BigNumberish } from "starknet/dist/utils/number"
import { toBN } from "starknet/dist/utils/number"
import { Uint256, isUint256, uint256ToBN } from "starknet/dist/utils/uint256"

import { normalizeAddress } from "../../ui/services/addresses"

export interface Erc721Call extends Call {
  calldata: [
    recipientAddressDecimal: string,
    tokenIdLowFelt: BigNumberish,
    tokenIdHighFelt: BigNumberish,
    unknown: string,
  ]
}

export const validateERC721Call = (call: Erc721Call) => {
  try {
    const { contractAddress, calldata } = call
    /** validate token address */
    validateAndParseAddress(contractAddress)
    /** validate recipient address */
    const [recipientAddressDecimal, amountLowFelt, amountHighFelt] = calldata
    validateAndParseAddress(recipientAddressDecimal)
    /** validate uint256 input amount */
    const amountUnit256: Uint256 = {
      low: amountLowFelt,
      high: amountHighFelt,
    }
    const amount = uint256ToBN(amountUnit256)
    /** final check for valid Unit256 that is > 0 */
    if (isUint256(amount) && toBN(amount).gt(toBN(0))) {
      return true
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}

export const parseErc721Call = (call: Erc721Call) => {
  const { contractAddress, calldata } = call
  const [
    fromAddressDecimal,
    toAddressDecimal,
    tokenIdLowFelt,
    tokenIdHighFelt,
  ] = calldata
  const fromAddress = normalizeAddress(fromAddressDecimal)
  const toAddress = normalizeAddress(toAddressDecimal)
  const tokenIdUnit256: Uint256 = {
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
