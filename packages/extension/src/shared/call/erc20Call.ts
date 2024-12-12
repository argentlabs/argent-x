import { normalizeAddress } from "@argent/x-shared"
import type { Call } from "starknet"
import { constants, num, uint256, validateAndParseAddress } from "starknet"

const { isUint256, uint256ToBN } = uint256

export interface Erc20Call extends Call {
  calldata: [
    /** recipient address as decimal e.g. 2007141710004580612847837172790366058109710402280793820610123055421682225678 */
    string,
    /**
     * amount as 2-part low and high felt
     * @see https://github.com/0xs34n/starknet.js/blob/develop/src/utils/uint256.ts
     * @see https://www.cairo-lang.org/docs/hello_cairo/intro.html#field-element
     */
    num.BigNumberish,
    num.BigNumberish,
  ]
}

export const validateERC20Call = (call: Erc20Call) => {
  try {
    const { contractAddress, calldata } = call
    /** validate token address */
    validateAndParseAddress(contractAddress)
    /** validate recipient address */
    const [recipientAddressDecimal, amountLowFelt, amountHighFelt] = calldata
    validateAndParseAddress(num.toHex(recipientAddressDecimal))
    /** validate uint256 input amount */
    const amount = uint256ToBN({
      low: amountLowFelt,
      high: amountHighFelt,
    })
    /** final check for valid Unit256 that is > 0 */
    if (isUint256(amount) && amount > constants.ZERO) {
      return true
    }
  } catch {
    // failure implies invalid
  }
  return false
}

export const parseErc20Call = (call: Erc20Call) => {
  const { contractAddress, calldata } = call
  const [recipientAddressDecimal, amountLowFelt, amountHighFelt] = calldata
  const recipientAddressHex = num.toHex(recipientAddressDecimal)
  const recipientAddress = normalizeAddress(recipientAddressHex)

  const amount = uint256ToBN({
    low: amountLowFelt,
    high: amountHighFelt,
  }).toString(10)

  return {
    contractAddress,
    recipientAddress,
    amount,
  }
}
