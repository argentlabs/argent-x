import { ARGENT_MULTISIG_URL } from "../../../../shared/api/constants"
import { Fetcher, fetcher } from "../../../../shared/api/fetcher"
import { Network } from "../../../../shared/network"
import { urlWithQuery } from "../../../../shared/utils/url"

export interface IFetchMultisigDataForSigner {
  signer: string
  network: Network
  fetcher?: Fetcher
}

export const networkToStarknetNetwork = (network: Network) => {
  switch (network.chainId) {
    case "SN_MAIN":
      return "mainnet"
    case "SN_GOERLI":
      return "testnet"
    case "SN_GOERLI2":
      return "testnet2"
    default:
      return "testnet"
  }
}

export interface ApiMultsigContent {
  address: string
  creator: string
  signers: string[]
  threshold: number
}

export interface ApiMultsigDataForSigner {
  totalPages: number
  totalElements: number
  size: number
  content: ApiMultsigContent[]
}

export function fetchMultisigDataForSigner({
  signer,
  network,
  fetcher: fetcherImpl = fetcher,
}: IFetchMultisigDataForSigner): Promise<ApiMultsigDataForSigner> {
  if (!ARGENT_MULTISIG_URL) {
    throw "Argent Multisig endpoint is not defined"
  }

  const starknetNetwork = networkToStarknetNetwork(network)

  const url = urlWithQuery([ARGENT_MULTISIG_URL, starknetNetwork], {
    signer,
  })

  return fetcherImpl(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
}
