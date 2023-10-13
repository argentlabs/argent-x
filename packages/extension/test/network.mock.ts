import { Network } from "../src/shared/network"

const defaultNetwork: Network = {
  id: "mock",
  name: "mockNetwork",
  chainId: "1",
  rpcUrl: "rpcUrl",
  multicallAddress: "multicallAddress",
  accountClassHash: {
    standard: "standard",
  },
}

export const getMockNetwork = (overrides?: Partial<Network>) => ({
  ...defaultNetwork,
  ...(overrides || {}),
})

export const getMockNetworkWithoutMulticall = (
  overrides?: Partial<Network>,
) => {
  return {
    ...getMockNetwork(overrides),
    multicallAddress: undefined,
  }
}
