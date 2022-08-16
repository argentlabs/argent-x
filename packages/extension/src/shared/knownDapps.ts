import untypedKnownDapps from "../assets/known-dapps.json"
import { isEqualAddress } from "../ui/services/addresses"
import { PublicNetworkIds } from "./network/public"

export interface KnownDapp {
  host: string
  title: string
  contracts: {
    [network in PublicNetworkIds]: string[]
  }
}

const knownDapps: KnownDapp[] = untypedKnownDapps

export { knownDapps }

export const includesAddress = (needle: string, haystack: string[]) => {
  return !!haystack.find((value) => isEqualAddress(value, needle))
}

export const isKnownDappForContractAddress = (
  address: string,
  network?: PublicNetworkIds,
) => {
  return !!getKnownDappForContractAddress(address, network)
}

export const getKnownDappForContractAddress = (
  address: string,
  network?: PublicNetworkIds,
) => {
  try {
    const knownContract = knownDapps.find(({ contracts }) => {
      if (network) {
        return includesAddress(address, Object.values(contracts[network]))
      }
      return includesAddress(address, Object.values(contracts).flat())
    })
    if (knownContract) {
      return knownContract
    }
  } catch (e) {
    // ignore parsing error
  }
}

export const getKnownDappForHost = (host: string) => {
  return knownDapps.find((knownDapp) => host === knownDapp.host)
}
