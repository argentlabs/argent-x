import { Call, ProviderInterface } from "starknet"
import { STANDARD_ACCOUNT_CLASS_HASH } from "../../network/constants"

export async function tryGetClassHashFromProvider(
  call: Call,
  provider: ProviderInterface,
): Promise<string> {
  return provider
    .callContract(call)
    .then((res) => res.result[0])
    .catch(() => provider.getClassHashAt(call.contractAddress))
    .catch(() => STANDARD_ACCOUNT_CLASS_HASH)
}
