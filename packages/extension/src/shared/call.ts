import { Call, validateAndParseAddress } from "starknet"
import { BigNumberish, toBN } from "starknet/dist/utils/number"
import { Uint256, isUint256, uint256ToBN } from "starknet/dist/utils/uint256"

import { normalizeAddress } from "../ui/services/addresses"

export interface Erc20TransferCall extends Call {
  calldata: [
    /** recipient address as decimal e.g. 2007141710004580612847837172790366058109710402280793820610123055421682225678 */
    recipientAddressDecimal: string,
    /**
     * amount as 2-part low and high felt
     * @see https://github.com/0xs34n/starknet.js/blob/develop/src/utils/uint256.ts
     * @see https://www.cairo-lang.org/docs/hello_cairo/intro.html#field-element
     */
    amountLowFelt: BigNumberish,
    amountHighFelt: BigNumberish,
  ]
}

/**
 * Checks if the call has the expected shape of an ERC20 transfer call
 * @param call Call
 * @returns true if the call passes validation
 */

export const isErc20TransferCall = (call: Call): call is Erc20TransferCall => {
  try {
    if (
      call &&
      call.contractAddress &&
      call.entrypoint === "transfer" &&
      call.calldata?.length === 3
    ) {
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
    }
  } catch (e) {
    // failure implies invalid
  }
  return false
}

/**
 * Parses an ERC20 transfer call
 * @param call Erc20TransferCall
 */

export const parseErc20TransferCall = (call: Erc20TransferCall) => {
  if (!isErc20TransferCall(call)) {
    throw "Invalid call"
  }
  const { contractAddress, calldata } = call
  const [recipientAddressDecimal, amountLowFelt, amountHighFelt] = calldata
  const recipientAddress = normalizeAddress(recipientAddressDecimal)
  const amountUnit256: Uint256 = {
    low: amountLowFelt,
    high: amountHighFelt,
  }
  const amount = uint256ToBN(amountUnit256).toString(10)
  return {
    contractAddress,
    recipientAddress,
    amount,
  }
}
