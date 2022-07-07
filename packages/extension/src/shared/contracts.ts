import untypedKnownContracts from "../assets/contracts/known-contracts.json"
import { KnownNetworksType } from "./networks"

export interface KnownContract {
  name: string
  icon: string
  contracts: {
    [network in KnownNetworksType]: string[]
  }
}

const knownContracts: KnownContract[] = untypedKnownContracts

export { knownContracts }

export const getKnownContractForAddress = (
  address: string,
  network?: KnownNetworksType,
) => {
  try {
    const knownContract = knownContracts.find(({ contracts }) => {
      if (network) {
        return Object.values(contracts[network]).includes(address)
      }
      return Object.values(contracts).flat().includes(address)
    })
    if (knownContract) {
      return knownContract
    }
  } catch (e) {
    // ignore parsing error
  }
}
