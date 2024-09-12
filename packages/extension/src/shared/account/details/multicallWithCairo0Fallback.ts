import { Call } from "starknet"
import { MinimalProviderInterface } from "@argent/x-multicall"

import { getEntryPointSafe } from "../../utils/transactions"

export async function multicallWithCairo0Fallback(
  call: Call,
  multicall: MinimalProviderInterface,
) {
  // Prioritize Cairo 1
  try {
    const callCairo1 = {
      ...call,
      entrypoint: getEntryPointSafe(call.entrypoint, "1"),
    }
    const response = await multicall.callContract(callCairo1)
    if (response !== undefined) {
      return response
    }
  } catch {
    // ignore multicall error
  }
  // Fallback to Cairo 0
  const callCairo0 = {
    ...call,
    entrypoint: getEntryPointSafe(call.entrypoint, "0"),
  }
  return await multicall.callContract(callCairo0)
}
