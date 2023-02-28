import { getDefaultProvider } from "ethers"

export const getDefaultEthersProvider = (networkId: string) => {
  return getDefaultProvider(
    networkId === "mainnet-alpha" ? "mainnet" : "goerli",
  )
}

export const getL1GasPrice = async (networkId: string) => {
  const ethersProvider = getDefaultEthersProvider(networkId)

  const { gasPrice } = await ethersProvider.getFeeData()

  return gasPrice
}
