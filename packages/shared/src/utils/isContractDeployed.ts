import { ProviderInterface } from "starknet"

export const isContractDeployed = async (
  provider: Pick<ProviderInterface, "getClassHashAt">,
  contractAddress: string,
): Promise<boolean> => {
  try {
    await provider.getClassHashAt(contractAddress)
    return true
  } catch (e) {
    return false
  }
}
