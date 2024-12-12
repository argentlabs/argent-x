import type { Call, ProviderInterface } from "starknet"
import { addressSchema, TXV1_ACCOUNT_CLASS_HASH } from "@argent/x-shared"

export async function tryGetClassHash(
  call: Call,
  provider: Pick<ProviderInterface, "callContract" | "getClassHashAt">,
  fallbackClassHash?: string,
): Promise<string> {
  try {
    const expected = await provider.callContract(call)
    return expected[0]
  } catch {
    try {
      const firstFallback = await provider.getClassHashAt(call.contractAddress)
      return addressSchema.parse(firstFallback)
    } catch {
      if (fallbackClassHash) {
        return fallbackClassHash
      }
      return TXV1_ACCOUNT_CLASS_HASH
    }
  }
}
