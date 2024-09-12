import { getAccountIdentifier, isEqualAddress } from "@argent/x-shared"
import { flatMap, isEmpty, keyBy, partition } from "lodash-es"

import { RefreshIntervalInSeconds } from "../../../shared/config"
import { IDebounceService } from "../../../shared/debounce"
import {
  addMultisigPendingOffchainSignatures,
  getMultisigPendingOffchainSignatures,
  multisigPendingOffchainSignatureSchema,
  removeMultisigPendingOffchainSignature,
} from "../../../shared/multisig/pendingOffchainSignaturesStore"
import {
  MultisigPendingTransaction,
  addToMultisigPendingTransactions,
  getMultisigPendingTransactions,
  multisigPendingTransactionToTransaction,
  removeFromMultisigPendingTransactions,
  removeRejectedOnChainPendingTransactions,
} from "../../../shared/multisig/pendingTransactionsStore"
import { multisigBaseWalletRepo } from "../../../shared/multisig/repository"
import { IMultisigBackendService } from "../../../shared/multisig/service/backend/IMultisigBackendService"
import { BasePendingMultisig } from "../../../shared/multisig/types"
import {
  getMultisigAccountFromBaseWallet,
  getMultisigAccounts,
} from "../../../shared/multisig/utils/baseMultisig"
import {
  getMultisigTransactionType,
  isMultisigTransactionRejectedAndNonceNotConsumed,
  transactionNeedsRetry,
} from "../../../shared/multisig/utils/getMultisigTransactionType"
import {
  getAllPendingMultisigs,
  pendingMultisigToMultisig,
} from "../../../shared/multisig/utils/pendingMultisig"
import { INetworkService } from "../../../shared/network/service/INetworkService"
import { INotificationService } from "../../../shared/notifications/INotificationService"
import { IScheduleService } from "../../../shared/schedule/IScheduleService"
import { routes } from "../../../shared/ui/routes"
import {
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  MultisigWalletAccount,
  WalletAccount,
  baseMultisigWalletAccountSchema,
} from "../../../shared/wallet.model"
import { IBackgroundUIService } from "../../services/ui/IBackgroundUIService"
import { everyWhenOpen } from "../../services/worker/schedule/decorators"
import { pipe } from "../../services/worker/schedule/pipe"
import { getAccountClassHashFromChain } from "../../../shared/account/details"
import { IAccountService } from "../../../shared/account/service/accountService/IAccountService"

const id = "multisigUpdate"

type Id = typeof id

export class MultisigWorker {
  constructor(
    private readonly scheduleService: IScheduleService<Id>,
    private readonly multisigBackendService: IMultisigBackendService,
    private readonly backgroundUiService: IBackgroundUIService,
    private readonly debounceService: IDebounceService<Id>,
    private readonly accountService: IAccountService,
    private networkService: Pick<INetworkService, "getById">,
    private readonly notificationService: INotificationService,
  ) {}

  updateAll = pipe(
    everyWhenOpen(
      this.backgroundUiService,
      this.scheduleService,
      this.debounceService,
      RefreshIntervalInSeconds.FAST,
      "MultisigWorker.updateAll",
    ),
  )(async (): Promise<void> => {
    console.log("Updating multisig data")
    await Promise.allSettled([
      this.updateDataForPendingMultisig(),
      this.updateDataForAccounts(),
      this.updateTransactions(),
      this.updateOffchainSignatures(),
      this.updateAccountClassHash(),
    ])
  })

  async updateDataForPendingMultisig() {
    // get all base mutlisig accounts
    const pendingMultisigs = await getAllPendingMultisigs()
    // Check with backend for any updates
    const updater = async (pendingMultisig: BasePendingMultisig) => {
      const network = await this.networkService.getById(
        pendingMultisig.networkId,
      )

      const { content } =
        await this.multisigBackendService.fetchMultisigDataForSigner({
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
        publicKey: pendingMultisig.publicKey,
        updatedAt: Date.now(),
      }

      this.sendMultisigAccountReadyNotification(baseMultisig)
      // If the content is not empty, it means that the account is now a multisig account
      return pendingMultisigToMultisig(pendingMultisig, baseMultisig)
    }
    await Promise.all(pendingMultisigs.map(updater))
  }

  async updateDataForAccounts() {
    // get all mutlisig accounts
    const multisigAccounts = await getMultisigAccounts()
    // Check with backend for any updates
    const updater = async (
      multisigWalletAccount: MultisigWalletAccount,
    ): Promise<BaseMultisigWalletAccount | null> => {
      const currentTime = Date.now()
      // 20 seconds in milliseconds. It is the time that workers are scheduled to update data from backend
      const TWENTY_SECONDS = RefreshIntervalInSeconds.FAST * 1000
      const lastUpdatedAt = multisigWalletAccount.updatedAt

      if (currentTime < lastUpdatedAt + TWENTY_SECONDS) {
        // if the account was updated less than 20 seconds ago, skip the update
        return baseMultisigWalletAccountSchema.parse(multisigWalletAccount)
      }

      const { address, networkId, publicKey } = multisigWalletAccount

      try {
        const { content } =
          await this.multisigBackendService.fetchMultisigAccountData({
            address,
            networkId,
          })

        return {
          ...content,
          address,
          networkId,
          publicKey,
          updatedAt: Date.now(),
        }
      } catch (error) {
        console.log(`Multisig ${address} not yet sync-ed`)
        return null
      }
    }

    const updaterResults = await Promise.allSettled(
      multisigAccounts.map(updater),
    )
    const updatedAccounts = updaterResults.filter(
      (result) => result.status === "fulfilled" && result.value !== null,
    ) as PromiseFulfilledResult<BaseMultisigWalletAccount>[]

    // Update the accounts
    await multisigBaseWalletRepo.upsert(
      updatedAccounts.map((result) => result.value),
    )
  }

  /**
   * This is needed to update the classhash for multisg accounts that were upgraded, for the owners that did not sign the upgrade tx. e.g. 2/3 multisig => the third owner will not get the classhash updated by the handleUpgradeTransaction method
   */
  async updateAccountClassHash() {
    const accounts = await this.accountService.get(
      (acc) => acc.type === "multisig",
    )

    const accountsWithClassHash = await getAccountClassHashFromChain(accounts)

    // Create a map to store accountWithClassHash with key as unique account id.
    const accountsWithClassHashMap = keyBy(
      accountsWithClassHash,
      getAccountIdentifier,
    )

    const updated = accounts
      .map((account) => {
        const id = getAccountIdentifier(account)
        return !isEqualAddress(
          accountsWithClassHashMap[id]?.classHash,
          account.classHash,
        )
          ? { ...account, ...accountsWithClassHashMap[id] }
          : undefined
      })
      .filter((account): account is WalletAccount => !!account)

    await this.accountService.upsert(updated)
  }

  async updateTransactions() {
    // fetch all requests for full multisig accounts
    const multisigs = await getMultisigAccounts()
    let localPendingRequests = await getMultisigPendingTransactions()
    const fetcher = async (multisig: MultisigWalletAccount) => {
      const account: BaseWalletAccount = {
        address: multisig.address,
        networkId: multisig.networkId,
      }
      const data =
        await this.multisigBackendService.fetchMultisigTransactionRequests(
          account,
        )
      return {
        ...data,
        account,
        multisig,
      }
    }

    const allRequestsData = await Promise.all(multisigs.map(fetcher))
    const allRequests = flatMap(allRequestsData, (a) =>
      a.content.map((c) => ({
        ...c,
        account: a.account,
        multisig: a.multisig,
      })),
    )

    const [pendingRequests, fulfilledRequests] = partition(
      allRequests,
      (r) =>
        r.state === "AWAITING_SIGNATURES" ||
        r.state === "SUBMITTED" ||
        r.state === "SUBMITTING" ||
        // this means that the tx was rejected by the sequencer, and the nonce was not consumed, so we need to keep the tx in the queue, and it can be retried or rejected
        transactionNeedsRetry(r, allRequests),
    )

    // Update the state of local pending requests with the state of the request from the backend. Also add new requests
    const updatedPendingMultisigTransactions = pendingRequests
      .map<MultisigPendingTransaction | undefined>((request) => {
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

        if (!request.transactionHash) {
          return
        }

        const multisigTransactionType = getMultisigTransactionType(
          request.transaction.calls,
        )

        const needsApproval =
          request.approvedSigners.length < request.multisig.threshold

        // Send notifications only for requests that still need approval
        if (needsApproval) {
          // if the request is not in the local pending requests, add it
          // Show notifications before adding to the store
          this.sendMultisigTransactionNotification(
            request.account,
            request.transactionHash,
            request.id,
          )
        }

        return {
          ...request,
          requestId: request.id,
          timestamp: Date.now(),
          transactionHash: request.transactionHash,
          notify: true,
          type: multisigTransactionType ?? "INVOKE",
        }
      })
      .filter((r): r is MultisigPendingTransaction => r !== undefined)

    if (updatedPendingMultisigTransactions.length > 0) {
      // if there are any updated pending transactions, add them to the store
      await addToMultisigPendingTransactions(
        updatedPendingMultisigTransactions.filter(
          // we need the SUBMITTED and SUBMITTING transactions only in the remove method, because the reject tx temporary has those states, and we need to know that there's a rejection tx
          (r) =>
            r.state === "AWAITING_SIGNATURES" ||
            isMultisigTransactionRejectedAndNonceNotConsumed(r.state),
        ),
      )
      // for rejected on-chain transactions the BE keeps both the initial tx and the rejection tx, so we need to filter out the initial ones
      await removeRejectedOnChainPendingTransactions(
        updatedPendingMultisigTransactions,
      )
    }

    // Update local pending requests with fulfilled requests
    localPendingRequests = await getMultisigPendingTransactions() // get the updated local pending requests

    const updatedFulfilledMultisigTransactions: MultisigPendingTransaction[] =
      localPendingRequests
        .map((request) => {
          const fulfilledRequest = fulfilledRequests.find(
            (r) => r.id === request.requestId,
          )
          if (fulfilledRequest) {
            return {
              ...request,
              requestId: request.requestId,
              state: fulfilledRequest.state,
            }
          }

          return null
        })
        .filter((r): r is MultisigPendingTransaction => r !== null) // simplify the filter condition

    // if there are any pending transactions that are fulfilled, remove them from the multisigPendingTransactions store
    // and add them to the transactions store
    await Promise.all(
      updatedFulfilledMultisigTransactions.map((r) =>
        multisigPendingTransactionToTransaction(r.requestId, r.state),
      ),
    )

    //remove the requests stuck in storage, but not in the backend
    const localRequestsToRemove = localPendingRequests.filter(
      (request) => !allRequests.some((r) => r.id === request.requestId),
    )
    await removeFromMultisigPendingTransactions(localRequestsToRemove)
  }

  async updateOffchainSignatures() {
    const multisigs = await getMultisigAccounts()
    const pendingOffchainSignatures =
      await getMultisigPendingOffchainSignatures()

    const fetcher = async (account: MultisigWalletAccount) => {
      const data =
        await this.multisigBackendService.fetchMultisigSignatureRequests(
          account,
        )
      return {
        ...data,
        account,
      }
    }

    const allSignatureRequestsData = await Promise.all(multisigs.map(fetcher))

    const allSignatureRequests = flatMap(allSignatureRequestsData, (a) =>
      a.content.map((c) => ({ ...c, account: a.account })),
    )

    const [pendingSignatureRequests, fulfilledSignatureRequests] = partition(
      allSignatureRequests,
      (r) => r.state === "AWAITING_SIGNATURES",
    )

    const updatedPendingOffchainSignatures = pendingSignatureRequests.map(
      (request) => {
        const localPendingRequest = pendingOffchainSignatures.find(
          (r) => r.requestId === request.id,
        )

        const signatureUpdate = {
          signatures: request.signatures,
          approvedSigners: request.approvedSigners,
          nonApprovedSigners: request.nonApprovedSigners,
          state: request.state, // Will be "AWAITING_SIGNATURES" because we are processing pending requests
        }

        return localPendingRequest
          ? { ...localPendingRequest, ...signatureUpdate }
          : multisigPendingOffchainSignatureSchema.parse({
              ...request,
              requestId: request.id,
              timestamp: Date.now(),
              notify: true,
            })
      },
    )

    if (updatedPendingOffchainSignatures.length > 0) {
      await addMultisigPendingOffchainSignatures(
        updatedPendingOffchainSignatures,
      )
    }

    const signaturesRequestsToRemove = (
      await getMultisigPendingOffchainSignatures()
    ).filter((request) =>
      fulfilledSignatureRequests.some((r) => r.id === request.requestId),
    )

    if (signaturesRequestsToRemove.length > 0) {
      await removeMultisigPendingOffchainSignature(signaturesRequestsToRemove)
    }
  }

  sendMultisigAccountReadyNotification(account: BaseWalletAccount) {
    const id = `MS:READY:${getAccountIdentifier(account)}`
    this.notificationService.showWithDeepLink(
      {
        id,
        account,
        route: routes.accountTokens(),
      },
      {
        title: "Multisig is ready!",
        status: "success",
      },
    )
  }

  sendMultisigTransactionNotification(
    account: BaseWalletAccount,
    hash: string,
    requestId: string,
  ) {
    const id = `MS:${hash}`
    this.notificationService.showWithDeepLink(
      {
        id,
        account,
        route: routes.multisigPendingTransactionDetails(
          account.address,
          requestId,
          routes.accountActivity(),
        ),
      },
      {
        title: "New multisig transaction is waiting for your approval",
        status: "success",
      },
    )
  }
}
