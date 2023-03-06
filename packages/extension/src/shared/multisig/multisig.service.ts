import { ARGENT_MULTISIG_URL } from "../api/constants"
import { Fetcher, fetcher } from "../api/fetcher"
import { Network } from "../network"
import { urlWithQuery } from "../utils/url"
import {
  ApiMultisigDataForSigner,
  ApiMultisigDataForSignerSchema,
} from "./multisig.model"
import { networkToStarknetNetwork } from "./utils"

export interface IFetchMultisigDataForSigner {
  signer: string
  network: Network
  fetcher?: Fetcher
}

export async function fetchMultisigDataForSigner({
  signer,
  network,
  fetcher: fetcherImpl = fetcher,
}: IFetchMultisigDataForSigner): Promise<ApiMultisigDataForSigner> {
  if (!ARGENT_MULTISIG_URL) {
    throw "Argent Multisig endpoint is not defined"
  }

  const starknetNetwork = networkToStarknetNetwork(network)

  const url = urlWithQuery([ARGENT_MULTISIG_URL, starknetNetwork], {
    signer,
  })

  const data = await fetcherImpl(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })

  return ApiMultisigDataForSignerSchema.parse(data)
}
