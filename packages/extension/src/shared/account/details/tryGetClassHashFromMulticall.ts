import { Call, ProviderInterface } from "starknet"
import { STANDARD_ACCOUNT_CLASS_HASH } from "../../network/constants"
import { addressSchema } from "@argent/shared"

export async function tryGetClassHash(
  call: Call,
  provider: Pick<ProviderInterface, "callContract" | "getClassHashAt">,
  fallbackClassHash?: string,
): Promise<string> {
  try {
    const expected = await provider.callContract(call)
    return expected.result[0]
  } catch (e) {
    try {
      const firstFallback = await provider.getClassHashAt(call.contractAddress)
      return addressSchema.parse(firstFallback)
    } catch (e) {
      if (fallbackClassHash) {
        return fallbackClassHash
      }
      return STANDARD_ACCOUNT_CLASS_HASH
    }
  }
}
