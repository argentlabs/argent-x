import type { Network } from "../src/shared/network"
import {
  ETH_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
} from "../src/shared/network/constants"

const defaultNetwork: Network = {
  id: "mock",
  name: "mockNetwork",
  chainId: "1",
  rpcUrl: "rpcUrl",
  multicallAddress: "0xmulticallAddress",
  accountClassHash: {
    standard: "standard",
  },
  possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS, STRK_TOKEN_ADDRESS],
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
