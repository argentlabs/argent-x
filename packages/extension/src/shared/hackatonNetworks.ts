import { Network } from "./networks"

export const hackatonNetworks: Network[] = Array(10)
  .fill(0)
  .map((_, i) => ({
    id: `hackaton${i}`,
    name: `Hackaton ${i}`,
    baseUrl: `https://hackathon-${i}.starknet.io`,
    chainId: `SN_GOERLI`,
    explorerUrl: `https://hackathon-${i}.voyager.online/`,
  }))
