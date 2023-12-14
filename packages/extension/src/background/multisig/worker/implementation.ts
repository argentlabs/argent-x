import { flatMap, isEmpty, partition } from "lodash-es"
import { hash, transaction } from "starknet"
import { getChainIdFromNetworkId } from "@argent/shared"

import { IBackgroundUIService } from "../../../background/__new/services/ui/interface"
import { IScheduleService } from "../../../shared/schedule/interface"
import { IMultisigBackendService } from "../../../shared/multisig/service/backend/interface"
import { INetworkService } from "../../../shared/network/service/interface"
import { RefreshInterval } from "../../../shared/config"
import {
  getAllPendingMultisigs,
  pendingMultisigToMultisig,
} from "../../../shared/multisig/utils/pendingMultisig"
import { BasePendingMultisig } from "../../../shared/multisig/types"
import {
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  MultisigWalletAccount,
  baseMultisigWalletAccountSchema,
} from "../../../shared/wallet.model"
import {
  sendMultisigAccountReadyNotification,
  sendMultisigTransactionNotification,
} from "../../../shared/notification"
import { getMultisigAccounts } from "../../../shared/multisig/utils/baseMultisig"
import { multisigBaseWalletRepo } from "../../../shared/multisig/repository"
import {
  MultisigPendingTransaction,
  addToMultisigPendingTransactions,
  getMultisigPendingTransactions,
  multisigPendingTransactionToTransaction,
} from "../../../shared/multisig/pendingTransactionsStore"
import { getMultisigTransactionType } from "../../../shared/multisig/utils/getMultisigTransactionType"
import { everyWhenOpen } from "../../__new/services/worker/schedule/decorators"
import { IDebounceService } from "../../../shared/debounce"
import { pipe } from "../../__new/services/worker/schedule/pipe"

const id = "multisigUpdate"

type Id = typeof id

export class MultisigWorker {
  constructor(
    private readonly scheduleService: IScheduleService<Id>,
    private readonly multisigBackendService: IMultisigBackendService,
    private readonly backgroundUiService: IBackgroundUIService,
    private readonly debounceService: IDebounceService<Id>,
    private networkService: Pick<INetworkService, "getById">,
  ) {}

  updateAll = pipe(
    everyWhenOpen(
      this.backgroundUiService,
      this.scheduleService,
      this.debounceService,
      RefreshInterval.FAST,
      "MultisigWorker.updateAll",
    ),
  )(async (): Promise<void> => {
    console.log("Updating multisig data")
    await Promise.all([
      this.updateDataForPendingMultisig(),
      this.updateDataForAccounts(),
      this.updateTransactions(),
    ])

    console.log("Updated multisig data. Sleeping for 20 seconds")
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

      sendMultisigAccountReadyNotification(baseMultisig.address)
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
      const TWENTY_SECONDS = RefreshInterval.FAST * 1000
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

  async updateTransactions() {
    // fetch all requests for full multisig accounts
    const multisigs = await getMultisigAccounts()
    let localPendingRequests = await getMultisigPendingTransactions()

    const fetcher = async (multisig: MultisigWalletAccount) => {
      const account: BaseWalletAccount = {
        address: multisig.address,
        networkId: multisig.networkId,
      }
      const data = await this.multisigBackendService.fetchMultisigRequests(
        account,
      )
      return {
        ...data,
        account,
      }
    }

    const allRequestsData = await Promise.all(multisigs.map(fetcher))

    const allRequests = flatMap(allRequestsData, (a) =>
      a.content.map((c) => ({
        ...c,
        account: a.account,
      })),
    )

    const [pendingRequests, fulfilledRequests] = partition(
      allRequests,
      (r) => r.state === "AWAITING_SIGNATURES",
    )

    // Update the state of local pending requests with the state of the request from the backend. Also add new requests
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

        const multisigTransactionType = getMultisigTransactionType(calls)

        const calldata = transaction.getExecuteCalldata(
          calls,
          "1", // Only Cairo version 1 is supported for multisig
        )

        const computedTransactionHash = hash.calculateTransactionHash(
          request.account.address,
          version,
          calldata,
          maxFee,
          getChainIdFromNetworkId(request.account.networkId),
          nonce,
        )

        // if the request is not in the local pending requests, add it
        // Show notifications before adding to the store
        sendMultisigTransactionNotification(computedTransactionHash)

        return {
          ...request,
          requestId: request.id,
          timestamp: Date.now(),
          transactionHash: request.transactionHash ?? computedTransactionHash,
          notify: true,
          type: multisigTransactionType ?? "INVOKE",
        }
      })

    if (updatedPendingMultisigTransactions.length > 0) {
      // if there are any updated pending transactions, add them to the store
      await addToMultisigPendingTransactions(updatedPendingMultisigTransactions)
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
  }
}
