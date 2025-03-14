import { ensureArray, isEqualAddress } from "@argent/x-shared"
import retry from "async-retry"
import { flatMap, isEmpty, keyBy, omit, partition } from "lodash-es"
import type { WalletAccountSharedService } from "./../../../shared/account/service/accountSharedService/WalletAccountSharedService"

import type { Call } from "starknet"
import { getAccountClassHashFromChain } from "../../../shared/account/details"
import type { IAccountService } from "../../../shared/account/service/accountService/IAccountService"
import type { IActivityCacheService } from "../../../shared/activity/cache/IActivityCacheService"
import {
  getNewSignerInReplaceMultisigSignerCall,
  isReplaceSelfAsSignerInMultisigCall,
} from "../../../shared/call/changeMultisigSignersCall"
import { RefreshIntervalInSeconds } from "../../../shared/config"
import type { IDebounceService } from "../../../shared/debounce"
import {
  addMultisigPendingOffchainSignatures,
  getMultisigPendingOffchainSignatures,
  multisigPendingOffchainSignatureSchema,
  removeMultisigPendingOffchainSignature,
} from "../../../shared/multisig/pendingOffchainSignaturesStore"
import type { MultisigPendingTransaction } from "../../../shared/multisig/pendingTransactionsStore"
import {
  addToMultisigPendingTransactions,
  getMultisigPendingTransactions,
  multisigPendingTransactionToTransaction,
  removeFromMultisigPendingTransactions,
  removeRejectedOnChainPendingTransactions,
} from "../../../shared/multisig/pendingTransactionsStore"
import type { IMultisigMetadataRepository } from "../../../shared/multisig/repository"
import type { IMultisigBackendService } from "../../../shared/multisig/service/backend/IMultisigBackendService"
import type {
  IMultisigBaseWalletRepositary,
  PendingMultisig,
} from "../../../shared/multisig/types"
import { MultisigEntryPointType } from "../../../shared/multisig/types"
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
import type { INetworkService } from "../../../shared/network/service/INetworkService"
import type { INotificationService } from "../../../shared/notifications/INotificationService"
import type { IScheduleService } from "../../../shared/schedule/IScheduleService"
import { routes } from "../../../shared/ui/routes"
import { getAccountIdentifier } from "../../../shared/utils/accountIdentifier"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { isArgentAccount } from "../../../shared/utils/isExternalAccount"
import type {
  ArgentWalletAccount,
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  MultisigWalletAccount,
} from "../../../shared/wallet.model"
import {
  SignerType,
  accountIdSchema,
  baseMultisigWalletAccountSchema,
} from "../../../shared/wallet.model"
import type { IActivityService } from "../../services/activity/IActivityService"
import { MultisigConfigurationUpdatedActivity } from "../../services/activity/IActivityService"
import type { IBackgroundUIService } from "../../services/ui/IBackgroundUIService"
import { everyWhenOpen } from "../../services/worker/schedule/decorators"
import { pipe } from "../../services/worker/schedule/pipe"
import { replaceValueInStorage } from "../../../shared/storage/__new/replaceValueInStorage"
import {
  getBaseDerivationPath,
  getDerivationPathForIndex,
} from "../../../shared/signer/utils"
import { getIndexForPath } from "../../../shared/utils/derivationPath"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const id = "multisigUpdate"

type Id = typeof id

export class MultisigWorker {
  constructor(
    private readonly multisigBaseWalletRepo: IMultisigBaseWalletRepositary,
    private readonly multisigMetadataRepo: IMultisigMetadataRepository,
    private readonly scheduleService: IScheduleService<Id>,
    private readonly multisigBackendService: IMultisigBackendService,
    private readonly backgroundUiService: IBackgroundUIService,
    private readonly debounceService: IDebounceService<Id>,
    private readonly accountService: IAccountService,
    private readonly walletAccountSharedService: WalletAccountSharedService,
    private networkService: Pick<INetworkService, "getById">,
    private readonly notificationService: INotificationService,
    private readonly activityCacheService: IActivityCacheService,
    private readonly activityService: IActivityService,
  ) {
    // Listen for activities to detect replacing self as signer
    this.activityService.emitter.on(
      MultisigConfigurationUpdatedActivity,
      this.onMultisigSignerChanges.bind(this),
    )
  }

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
      this.updateBaseMultisigWalletId(),
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
    const updater = async (pendingMultisig: PendingMultisig) => {
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

      // the BE returns the multisigs from where the signer was removed too. So the content length can be > 1.
      // This can happen especially if you join a multisig, are removed, restore then try to join another multisig. The pub key is likely to be the same as the one from your first multisig
      const validMultisigData = content.find((c) =>
        c.signers.some((s) => isEqualAddress(s, pendingMultisig.publicKey)),
      )

      if (!validMultisigData) {
        return
      }

      const address = validMultisigData.address
      const networkId = pendingMultisig.networkId

      const accountId = getAccountIdentifier(
        address,
        networkId,
        pendingMultisig.signer,
      )

      const baseMultisig: BaseMultisigWalletAccount = {
        id: accountId,
        address,
        networkId,
        signers: validMultisigData.signers,
        threshold: validMultisigData.threshold,
        creator: validMultisigData.creator,
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

      const { id, address, networkId, publicKey, pendingSigner } =
        multisigWalletAccount

      try {
        const { content } =
          await this.multisigBackendService.fetchMultisigAccountData({
            id,
            address,
            networkId,
          })

        return {
          ...content,
          id,
          address,
          networkId,
          publicKey,
          updatedAt: Date.now(),
          pendingSigner,
        }
      } catch {
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
    await this.multisigBaseWalletRepo.upsert(
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
    const argentAccounts = accounts.filter(isArgentAccount)

    const accountsWithClassHash =
      await getAccountClassHashFromChain(argentAccounts)

    // Create a map to store accountWithClassHash with key as unique account id.
    const accountsWithClassHashMap = keyBy(accountsWithClassHash, "id")

    const updated = accounts
      .map((account) => {
        return !isEqualAddress(
          accountsWithClassHashMap[account.id]?.classHash,
          account.classHash,
        )
          ? { ...account, ...accountsWithClassHashMap[account.id] }
          : undefined
      })
      .filter((account): account is ArgentWalletAccount => !!account)

    await this.accountService.upsert(updated)
  }

  async updateTransactions() {
    // fetch all requests for full multisig accounts
    const multisigs = await getMultisigAccounts()
    let localPendingRequests = await getMultisigPendingTransactions()

    // collect the initial id's, this provides a simple way to know which 'new' request id' to notify user about later
    const initialLocalPendingRequestIds = localPendingRequests.map(
      (localPendingRequest) => localPendingRequest.requestId,
    )

    const fetcher = async (multisig: MultisigWalletAccount) => {
      const account: BaseWalletAccount = {
        id: multisig.id,
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
    const updatedPendingMultisigTransactions =
      pendingRequests.flatMap<MultisigPendingTransaction>((request) => {
        const localPendingRequest = localPendingRequests.find(
          (r) =>
            accountsEqual(r.account, request.account) &&
            r.requestId === request.id,
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
          return []
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

    if (updatedPendingMultisigTransactions.length > 0) {
      // if there are any updated pending transactions, add them to the store
      const updatedPendingMultisigTransactionsToAdd =
        updatedPendingMultisigTransactions.filter(
          // we need the SUBMITTED and SUBMITTING transactions only in the remove method, because the reject tx temporary has those states, and we need to know that there's a rejection tx
          (r) =>
            r.state === "AWAITING_SIGNATURES" ||
            isMultisigTransactionRejectedAndNonceNotConsumed(r.state),
        )
      await addToMultisigPendingTransactions(
        updatedPendingMultisigTransactionsToAdd,
      )
      // for rejected on-chain transactions the BE keeps both the initial tx and the rejection tx, so we need to filter out the initial ones
      await removeRejectedOnChainPendingTransactions(
        updatedPendingMultisigTransactions,
      )
    }

    // Update local pending requests with fulfilled requests
    localPendingRequests = await getMultisigPendingTransactions() // get the updated local pending requests

    const updatedFulfilledMultisigTransactions: MultisigPendingTransaction[] =
      localPendingRequests.flatMap((request) => {
        const fulfilledRequest = fulfilledRequests.find(
          (r) => r.id === request.requestId,
        )
        if (!fulfilledRequest) {
          return []
        }
        return {
          ...request,
          requestId: request.requestId,
          state: fulfilledRequest.state,
        }
      })

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

    // Finally, determine what new requests have actually been added, and notify user
    localPendingRequests = await getMultisigPendingTransactions()
    const finalLocalPendingRequestIds = localPendingRequests.map(
      (localPendingRequest) => localPendingRequest.requestId,
    )

    const newRequestIds = finalLocalPendingRequestIds.filter(
      (finalRequestId) =>
        !initialLocalPendingRequestIds.includes(finalRequestId),
    )
    newRequestIds.forEach((newRequestId) => {
      const request = localPendingRequests.find(
        (request) => request.requestId === newRequestId,
      )
      if (!request) {
        return // shouldn't happen
      }
      const multisig = multisigs.find((multisig) =>
        accountsEqual(request.account, multisig),
      )
      if (!multisig) {
        return // shouldn't happen
      }
      // Send notifications only for requests that still need approval
      const needsApproval = request.approvedSigners.length < multisig.threshold
      if (!needsApproval) {
        return
      }
      this.sendMultisigTransactionNotification(
        request.account,
        request.transactionHash,
        request.requestId,
      )
    })
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
    const id = `MS:READY:${account.id}`
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
          account.id,
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

  async findNewSignerInActivity(account: MultisigWalletAccount) {
    const accountActivities =
      await this.activityCacheService.getCachedActivities(account)
    for (const activity of ensureArray(accountActivities)) {
      const action = activity.actions?.find(
        (action) => action.name === "account_multisig_replace_signer",
      )

      const property = action?.defaultProperties?.find(
        (property) =>
          property.type === "calldata" &&
          property.entrypoint === MultisigEntryPointType.REPLACE_SIGNER &&
          "calldata" in property,
      )
      const replaceSignerCall = {
        ...property,
        contractAddress: account.address,
      } as Call

      if (
        !isReplaceSelfAsSignerInMultisigCall(
          replaceSignerCall,
          account.publicKey,
        )
      ) {
        return
      }

      const newSigner =
        getNewSignerInReplaceMultisigSignerCall(replaceSignerCall)

      if (
        !newSigner ||
        !isEqualAddress(newSigner, account.pendingSigner?.pubKey)
      ) {
        return
      }
      return newSigner
    }
  }

  private async updateMultisigMetadataWithPendingSigner(
    multisigData: MultisigWalletAccount,
  ): Promise<void> {
    if (!multisigData.pendingSigner) {
      return
    }

    const [multisigMetadata] = await this.multisigMetadataRepo.get(
      (multisigMetadata) =>
        isEqualAddress(
          multisigMetadata.multisigPublicKey,
          multisigData.publicKey,
        ),
    )

    const newMultisigMetadata = {
      multisigPublicKey: multisigData.pendingSigner.pubKey,
      signers:
        multisigMetadata?.signers.filter(
          (signer) => !isEqualAddress(signer.key, multisigData.publicKey),
        ) ?? [],
    }

    await this.multisigMetadataRepo.upsert(newMultisigMetadata)
    await this.multisigMetadataRepo.remove(multisigMetadata)
  }

  /**
   * Checks for self signer changes. If there are any, it will update the account with the new signer and the multisig account data with the new public key.
   *  1. find the activities of type replaceSelfAsSigner
   *  2. check if the multisig has the pendingSigner field set
   *  3. check if the multisig pendingSigner pub key matches the new signer extracted from the transaction
   *  4. update the multisig pub key
   *  5. update the account signer
   *  6. update the multisig metadata
   *  7. replace the account id with the new one everywhere in storage
   */
  async onMultisigSignerChanges(accounts: BaseWalletAccount[]) {
    for (const account of accounts) {
      const multisigData = await getMultisigAccountFromBaseWallet(account)

      if (!multisigData?.pendingSigner) {
        return
      }

      // needs retry in case the activities list is not updated yet
      const newSigner = await retry(
        async () => {
          const response = await this.findNewSignerInActivity(multisigData)
          if (response) {
            return response
          } else {
            throw new Error("Retrying..")
          }
        },
        {
          retries: 5,
          minTimeout: 1000,
          maxTimeout: 1000,
        },
      )

      if (!newSigner) {
        return
      }
      // update the signers too to avoid showing the 'You were removed from this multisig' screen until the updateDataForAccounts runs again
      const oldPubKey = multisigData.publicKey
      const newSigners = multisigData.signers.map((signer) =>
        isEqualAddress(signer, oldPubKey) ? newSigner : signer,
      )

      const accountId = getAccountIdentifier(
        multisigData.address,
        multisigData.networkId,
        multisigData.pendingSigner.signer,
      )

      // we cannot update the account as the id changes. So we add the new one and remove the old
      const updatedMultisigData = {
        ...multisigData,
        id: accountId,
        signers: newSigners,
        publicKey: multisigData.pendingSigner.pubKey,
        pendingSigner: undefined,
      }
      await this.multisigBaseWalletRepo.upsert(updatedMultisigData)
      await this.multisigBaseWalletRepo.remove((account) =>
        accountsEqual(account, multisigData),
      )

      const [walletAccount] =
        await this.accountService.getFromBaseWalletAccounts([account])

      await this.accountService.upsert({
        ...walletAccount,
        id: accountId,
        signer: multisigData.pendingSigner.signer,
      })
      await this.accountService.removeById(walletAccount.id)

      await this.updateMultisigMetadataWithPendingSigner(multisigData)

      await this.walletAccountSharedService.selectAccount(accountId)

      await replaceValueInStorage(walletAccount.id, accountId, ["id"])
    }
  }
  // Migration from legacy accounts without IDs to the new ID-based accounts is necessary.
  // A similar migration is performed in AccountWorker; however, it is also essential here to update the stored Multisig Data.
  // This ensures the construction of complete Multisig Accounts by merging them with WalletAccount records via their IDs.
  async updateBaseMultisigWalletId() {
    const walletAccounts = await this.accountService.get()

    const walletAccountsMap = keyBy(walletAccounts, "id")
    const baseMultisigs = await this.multisigBaseWalletRepo.get()
    const baseMultisigsWithoutId = baseMultisigs.filter(
      (account) => !accountIdSchema.safeParse(account.id).success, // This is future-proof as we can change the id format in the future
    )

    if (baseMultisigsWithoutId.length === 0) {
      return
    }

    const supportedSigners = Object.values(omit(SignerType, "PRIVATE_KEY")) // Multisig accounts can't be created with private key signers
    const updatedAccountsWithoutId: BaseMultisigWalletAccount[] = []

    for (const multisig of baseMultisigsWithoutId) {
      const { index, address, networkId } = multisig
      // Check if index is present
      if (index !== undefined) {
        signerLoop: for (const signerType of supportedSigners) {
          const signer = {
            type: signerType,
            derivationPath: getDerivationPathForIndex(
              index,
              signerType,
              "multisig",
            ),
          }
          const accountId = getAccountIdentifier(address, networkId, signer)

          // Check if the account exists in the wallet accounts
          if (walletAccountsMap[accountId]) {
            updatedAccountsWithoutId.push({
              ...multisig,
              id: accountId,
            })
            break signerLoop
          }
        }

        // If index is not present, we will have to naively add accountId with the fact
        // that only single signer was used in the same multisig wallet instance
      } else {
        const account = walletAccounts.find(
          (acc) =>
            isEqualAddress(acc.address, multisig.address) &&
            acc.networkId === multisig.networkId,
        )
        if (account) {
          updatedAccountsWithoutId.push({
            ...multisig,
            id: account.id,
            index: getIndexForPath(
              account.signer.derivationPath,
              getBaseDerivationPath("multisig", account.signer.type),
            ),
          })
        }
      }
    }

    await this.multisigBaseWalletRepo.remove(
      (acc) => !accountIdSchema.safeParse(acc.id).success, // Need to use selector function instead of values to override the default compare function
    )

    await this.multisigBaseWalletRepo.upsert(updatedAccountsWithoutId)
  }
}
