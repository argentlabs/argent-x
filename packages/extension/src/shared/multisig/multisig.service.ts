import { Call } from "starknet"
import urlJoin from "url-join"

import { ARGENT_MULTISIG_URL } from "../api/constants"
import { Fetcher, fetcher } from "../api/fetcher"
import { Network } from "../network"
import {
  networkIdToStarknetNetwork,
  networkToStarknetNetwork,
} from "../utils/starknetNetwork"
import { urlWithQuery } from "../utils/url"
import {
  ApiMultisigContent,
  ApiMultisigDataForSigner,
  ApiMultisigDataForSignerSchema,
  ApiMultisigGetRequests,
  ApiMultisigGetRequestsSchema,
  ApiMultisigTxnResponse,
} from "./multisig.model"

const multisigTransactionTypes = {
  addSigners: "addSigners",
  changeThreshold: "changeThreshold",
  removeSigners: "removeSigners",
  replaceSigner: "replaceSigner",
} as const
export interface IFetchMultisigDataForSigner {
  signer: string
  network: Network
  fetcher?: Fetcher<ApiMultisigDataForSigner>
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

export const getMultisigTransactionType = (transactions: Call[]) => {
  const entryPoints = transactions.map((tx) => tx.entrypoint)
  switch (true) {
    case entryPoints.includes("addSigners"): {
      return multisigTransactionTypes.addSigners
    }
    case entryPoints.includes("changeThreshold"): {
      return multisigTransactionTypes.changeThreshold
    }
    default: {
      return undefined
    }
  }
}

export interface IFetchMultisigAccountData {
  address: string
  networkId: string
  fetcher?: Fetcher<{
    content: ApiMultisigContent
  }>
}

export const fetchMultisigAccountData = async ({
  address,
  networkId,
  fetcher: fetcherImpl = fetcher,
}: IFetchMultisigAccountData) => {
  try {
    if (!ARGENT_MULTISIG_URL) {
      throw new Error("Multisig endpoint is not defined")
    }

    const starknetNetwork = networkIdToStarknetNetwork(networkId)

    const url = urlJoin(ARGENT_MULTISIG_URL, starknetNetwork, address)

    return fetcherImpl(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
  } catch (e) {
    throw new Error(`An error occured ${e}`)
  }
}

export const fetchMultisigRequestData = async ({
  address,
  networkId,
  requestId,
}: {
  address: string
  networkId: string
  requestId: string
}) => {
  try {
    if (!ARGENT_MULTISIG_URL) {
      throw new Error("Multisig endpoint is not defined")
    }

    const starknetNetwork = networkIdToStarknetNetwork(networkId)
    const url = urlJoin(
      ARGENT_MULTISIG_URL,
      starknetNetwork,
      address,
      "request",
      requestId,
    )

    return fetcher<ApiMultisigTxnResponse>(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
  } catch (e) {
    throw new Error(`An error occured ${e}`)
  }
}

export const fetchMultisigRequests = async ({
  address,
  networkId,
}: {
  address: string
  networkId: string
}): Promise<ApiMultisigGetRequests> => {
  try {
    if (!ARGENT_MULTISIG_URL) {
      throw new Error("Multisig endpoint is not defined")
    }

    const starknetNetwork = networkIdToStarknetNetwork(networkId)

    const url = urlJoin(
      ARGENT_MULTISIG_URL,
      starknetNetwork,
      address,
      "request",
    )

    const data = await fetcher<unknown>(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    return ApiMultisigGetRequestsSchema.parse(data)
  } catch (e) {
    throw new Error(`An error occured ${e}`)
  }
}
