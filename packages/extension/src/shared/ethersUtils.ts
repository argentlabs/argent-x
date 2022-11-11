import { ethers } from "ethers"

export const getDefaultEthersProvider = (networkId: string) => {
  return ethers.getDefaultProvider(
    networkId === "mainnet-alpha" ? "mainnet" : "goerli",
  )
}

export const getL1GasPrice = async (networkId: string) => {
  const ethersProvider = getDefaultEthersProvider(networkId)

  const gasInWei = await ethersProvider.getGasPrice()

  return gasInWei
}
