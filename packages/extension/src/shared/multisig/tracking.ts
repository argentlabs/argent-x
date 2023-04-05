import { flatMap, isEmpty, partition } from "lodash-es"
import { hash, transaction } from "starknet"

import { getNetwork } from "../network"
import { networkIdToChainId } from "../utils/starknetNetwork"
import {
  BaseMultisigWalletAccount,
  MultisigWalletAccount,
} from "../wallet.model"
import {
  fetchMultisigAccountData,
  fetchMultisigDataForSigner,
  fetchMultisigRequests,
} from "./multisig.service"
import {
  MultisigPendingTransaction,
  addToMultisigPendingTransactions,
  getMultisigPendingTransactions,
  removeFromMultisigPendingTransactions,
} from "./pendingTransactionsStore"
import { multisigBaseWalletStore } from "./store"
import { BasePendingMultisig } from "./types"
import { getMultisigAccounts } from "./utils/baseMultisig"
import { pendingMultisigToMultisig } from "./utils/pendingMultisig"
import { getAllPendingMultisigs } from "./utils/pendingMultisig"

export interface MultisigTracker {
  updateDataForPendingMultisig: () => Promise<void>
  updateDataForAccounts: () => Promise<void>
  updateTransactions: () => Promise<void>
}

export const multisigTracker: MultisigTracker = {
  async updateDataForPendingMultisig() {
    // get all base mutlisig accounts
    const pendingMultisigs = await getAllPendingMultisigs()

    // Check with backend for any updates
    const updater = async (pendingMultisig: BasePendingMultisig) => {
      const network = await getNetwork(pendingMultisig.networkId)

      const { content } = await fetchMultisigDataForSigner({
        signer: pendingMultisig.publicKey,
        network,
      })

      if (isEmpty(content)) {
        // early return if the content is empty
        return
      }

      const baseMultisig: BaseMultisigWalletAccount = {
        address: content[0].address,
        networkId: pendingMultisig.networkId,
        signers: content[0].signers,
        threshold: content[0].threshold,
        creator: content[0].creator,
      }

      // If the content is not empty, it means that the account is now a multisig account
      return pendingMultisigToMultisig(pendingMultisig, baseMultisig)
    }
    await Promise.all(pendingMultisigs.map(updater))
  },

  async updateDataForAccounts() {
    // get all mutlisig accounts
    const multisigAccounts = await getMultisigAccounts()
    // Check with backend for any updates
    const updater = async ({
      address,
      networkId,
    }: MultisigWalletAccount): Promise<BaseMultisigWalletAccount> => {
      const { content } = await fetchMultisigAccountData({
        address,
        networkId,
      })

      return {
        ...content,
        address,
        networkId,
      }
    }

    const updated = await Promise.all(multisigAccounts.map(updater))

    // Update the accounts
    await multisigBaseWalletStore.push(updated)
  },
  async updateTransactions() {
    // fetch all requests for full multisig accounts
    const multisigs = await getMultisigAccounts()
    let localPendingRequests = await getMultisigPendingTransactions()

    const fetcher = async (multisig: MultisigWalletAccount) => {
      const data = await fetchMultisigRequests({
        address: multisig.address,
        networkId: multisig.networkId,
      })

      return {
        ...data,
        address: multisig.address,
        networkId: multisig.networkId,
      }
    }

    const allRequestsData = await Promise.all(multisigs.map(fetcher))

    const allRequests = flatMap(allRequestsData, (a) =>
      a.content.map((c) => ({
        ...c,
        address: a.address,
        networkId: a.networkId,
      })),
    )

    console.log(
      "🚀 ~ file: tracking.ts:116 ~ allRequests ~ allRequests:",
      allRequests,
    )

    const [pendingRequests, fulfilledRequests] = partition(
      allRequests,
      (r) => r.state === "AWAITING_SIGNATURES",
    )

    console.log(
      "🚀 ~ file: tracking.ts:126 ~ updateTransactions ~ pendingRequests:",
      pendingRequests,
    )

    // Cases to handle:
    // 1. Update the state of local pending requests with the state of the request from the backend. Also add new requests
    const updatedPendingMultisigTransactions =
      pendingRequests.map<MultisigPendingTransaction>((request) => {
        const localPendingRequest = localPendingRequests.find(
          (r) => r.requestId === request.id,
        )

        if (localPendingRequest) {
          // if the request is already in the local pending requests, update the state
          return {
            ...localPendingRequest,
            state: request.state,
            approvedSigners: request.approvedSigners,
            nonApprovedSigners: request.nonApprovedSigners,
          }
        }

        const { version, maxFee, calls, nonce } = request.transaction

        const computedTransactionHash = hash.calculateTransactionHash(
          request.address,
          version,
          transaction.fromCallsToExecuteCalldata(calls),
          maxFee,
          networkIdToChainId(request.networkId),
          nonce,
        )

        // if the request is not in the local pending requests, add it
        return {
          ...request,
          requestId: request.id,
          timestamp: Date.now(),
          transactionHash: request.transactionHash ?? computedTransactionHash,
        }
      })

    console.log(
      "🚀 ~ file: tracking.ts:125 ~ updateTransactions ~ updatedPendingMultisigTransactions:",
      updatedPendingMultisigTransactions,
    )

    if (updatedPendingMultisigTransactions.length > 0) {
      // if there are any updated pending transactions, add them to the store
      await addToMultisigPendingTransactions(updatedPendingMultisigTransactions)
    }

    // 2. Update local pending requests with fulfilled requests
    localPendingRequests = await getMultisigPendingTransactions() // get the updated local pending requests

    const updatedFulfilledMultisigTransactions = localPendingRequests.filter(
      (request) => {
        return fulfilledRequests.some((r) => r.id === request.requestId)
      },
    )

    if (updatedFulfilledMultisigTransactions.length > 0) {
      // if there are any pending transactions that are fulfilled, remove them from the store
      await removeFromMultisigPendingTransactions(
        updatedFulfilledMultisigTransactions,
      )
    }
  },
}
