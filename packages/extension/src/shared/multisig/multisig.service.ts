import { Call } from "starknet"
import urlJoin from "url-join"

import { ARGENT_MULTISIG_URL } from "../api/constants"
import { Fetcher, fetcher } from "../api/fetcher"
import { sendMessage, waitForMessage } from "../messages"
import { Network } from "../network"
import { networkToStarknetNetwork } from "../utils/starknetNetwork"
import { urlWithQuery } from "../utils/url"
import {
  AddOwnerMultisiPayload,
  UpdateMultisigThresholdPayload,
} from "../wallet.model"
import {
  ApiMultisigContent,
  ApiMultisigDataForSigner,
  ApiMultisigDataForSignerSchema,
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

export const getMultisigAccountData = async ({
  address,
  networkId,
}: {
  address: string
  networkId: string
}) => {
  try {
    if (!ARGENT_MULTISIG_URL) {
      throw new Error("Multisig endpoint is not defined")
    }
    const url = urlJoin(ARGENT_MULTISIG_URL, `${networkId}/${address}`)
    return fetcher<{
      content: ApiMultisigContent
    }>(url, {
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

export const getMultisigRequestData = async ({
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
    const url = urlJoin(
      ARGENT_MULTISIG_URL,
      `${networkId}/${address}/request/${requestId}`,
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

export const addMultisigOwners = async (data: AddOwnerMultisiPayload) => {
  sendMessage({ type: "ADD_MULTISIG_OWNERS", data })

  const response = await Promise.race([
    waitForMessage("ADD_MULTISIG_OWNERS_RES"),
    waitForMessage("ADD_MULTISIG_OWNERS_REJ"),
  ])

  if (response && "error" in response) {
    throw new Error(response.error)
  }
}

export const updateMultisigThreshold = async (
  data: UpdateMultisigThresholdPayload,
) => {
  sendMessage({ type: "UPDATE_MULTISIG_THRESHOLD", data })

  const response = await Promise.race([
    waitForMessage("UPDATE_MULTISIG_THRESHOLD_RES"),
    waitForMessage("UPDATE_MULTISIG_THRESHOLD_REJ"),
  ])

  if (response && "error" in response) {
    throw new Error(response.error)
  }
}
