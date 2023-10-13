import { ProviderInterface } from "starknet"

export const isContractDeployed = async (
  provider: ProviderInterface,
  contractAddress: string,
): Promise<boolean> => {
  try {
    await provider.getClassHashAt(contractAddress)
    return true
  } catch (e) {
    return false
  }
}
