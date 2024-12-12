import type { Address } from "@argent/x-shared"
import { addressSchema } from "@argent/x-shared"
import { isArray } from "lodash-es"
import type { Call } from "starknet"
import { CallData, num, uint256 } from "starknet"

export function parseTransferTokenCall(
  calls: Call | Call[],
): { tokenAddress: Address; recipient: Address; amount: bigint } | undefined {
  const call = isArray(calls) ? calls[0] : calls
  const calldata = CallData.toCalldata(call.calldata)
  if (call.entrypoint !== "transfer" || calldata.length !== 3) {
    // Transfer will always have 3 arguments: [receipient, amountLow, amountHigh]
    return undefined
  }
  try {
    const tokenAddress = addressSchema.parse(num.toHex(call.contractAddress))
    const recipient = addressSchema.parse(num.toHex(calldata[0]))
    const amount = uint256.uint256ToBN({ low: calldata[1], high: calldata[2] })
    return { tokenAddress, recipient, amount }
  } catch {
    return undefined
  }
}
