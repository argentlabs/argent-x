import { Multicall } from "@argent/x-multicall"
import { Call, ProviderInterface } from "starknet"
import { STANDARD_ACCOUNT_CLASS_HASH } from "../../network/constants"

export async function tryGetClassHashFromMulticall(
  call: Call,
  multicall: Multicall,
  provider: ProviderInterface,
  fallbackClassHash?: string,
): Promise<string> {
  return multicall
    .call(call)
    .then(([classHash]) => classHash)
    .catch(() => provider.getClassHashAt(call.contractAddress))
    .catch(() => {
      if (fallbackClassHash) {
        return fallbackClassHash
      }
      return STANDARD_ACCOUNT_CLASS_HASH
    })
}
