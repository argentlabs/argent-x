import untypedKnownDapps from "../assets/known-dapps.json"
import { isEqualAddress } from "../ui/services/addresses"
import { PublicNetworkIds } from "./network/public"

export interface KnownDapp {
  /** a unique internal id for this dapp e.g. my-dapp-xyz */
  id: string
  /** the dapp hostname e.g. mydapp.example.xyz */
  host: string
  /** the display title */
  title: string
  /** known contract addresses per network */
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
  address?: string,
  network?: PublicNetworkIds,
) => {
  if (!address) {
    return
  }
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

export const getKnownDappForId = (id: string) => {
  return knownDapps.find((knownDapp) => id === knownDapp.id)
}
