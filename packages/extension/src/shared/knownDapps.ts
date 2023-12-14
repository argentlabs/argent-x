import untypedKnownDapps from "../assets/known-dapps.json"
import { isEqualAddress } from "../ui/services/addresses"

export interface KnownDapp {
  /** a unique internal id for this dapp e.g. mydapp-example-xyz */
  id: string
  /** the dapp hostnames e.g. mydapp.example.xyz */
  hosts: string[]
  /** the display title */
  title: string
  /** default icon if one cannot be retrieved automatically by {@link getDappDisplayAttributes} */
  icon?: string
  /** known contract addresses per network */
  contracts: {
    [network: string]: string[]
  }
  /** dapp url on dappland */
  dappland?: string
}

const knownDapps: KnownDapp[] = untypedKnownDapps

export { knownDapps }

export const includesAddress = (needle: string, haystack: string[]) => {
  return !!haystack.find((value) => isEqualAddress(value, needle))
}

export const isKnownDappForContractAddress = (
  address: string,
  network?: string,
) => {
  return !!getKnownDappForContractAddress(address, network)
}

export const getKnownDappForContractAddress = (
  address?: string,
  network?: string,
) => {
  if (!address) {
    return
  }
  try {
    const knownContract = knownDapps.find(({ contracts }) => {
      if (network) {
        return includesAddress(address, contracts[network] ?? [])
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
  return knownDapps.find((knownDapp) => knownDapp.hosts.includes(host))
}

export const getKnownDappForId = (id: string) => {
  return knownDapps.find((knownDapp) => id === knownDapp.id)
}
