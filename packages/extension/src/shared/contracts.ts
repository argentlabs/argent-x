import untypedKnownDappContracts from "../assets/contracts/known-dapp-contracts.json"
import { PublicNetworkIds } from "./network/public"

export interface KnownDappContract {
  host: string
  contracts: {
    [network in PublicNetworkIds]: string[]
  }
}

const knownDappContracts: KnownDappContract[] = untypedKnownDappContracts

export { knownDappContracts }

export const getKnownContractForAddress = (
  address: string,
  network?: PublicNetworkIds,
) => {
  try {
    const knownContract = knownDappContracts.find(({ contracts }) => {
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
