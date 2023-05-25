import { SequencerProvider } from "starknet"

export const isContractDeployed = async (
  provider: SequencerProvider,
  contractAddress: string,
): Promise<boolean> => {
  try {
    await provider.getClassHashAt(contractAddress)
    return true
  } catch (e) {
    return false
  }
}
