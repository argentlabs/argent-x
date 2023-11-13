import { addressSchema, getAccountIdentifier } from "@argent/shared"
import { uniq } from "lodash-es"

import { IBackgroundUIService, Opened } from "../../ui/interface"
import { Wallet } from "../../../../wallet"
import { Locked } from "../../../../wallet/session/interface"
import { WalletSessionService } from "../../../../wallet/session/session.service"
import { RefreshInterval } from "../../../../../shared/config"
import { INFTService } from "../../../../../shared/nft/interface"
import { IScheduleService } from "../../../../../shared/schedule/interface"
import { WalletStorageProps } from "../../../../../shared/wallet/walletStore"
import { ArrayStorage, KeyValueStorage } from "../../../../../shared/storage"
import { Transaction } from "../../../../../shared/transactions"
import { transactionSucceeded } from "../../../../../shared/utils/transactionSucceeded"
import { INFTWorkerStore } from "../../../../../shared/nft/worker/interface"

const TASK_ID = "NftsWorker.updateNfts"
const REFRESH_PERIOD_MINUTES = Math.floor(RefreshInterval.SLOW / 60)

export class NftsWorker {
  constructor(
    private readonly nftsService: INFTService,
    private readonly scheduleService: IScheduleService<typeof TASK_ID>,
    private readonly walletSingleton: Wallet,
    private walletStore: KeyValueStorage<WalletStorageProps>,
    private readonly transactionsStore: ArrayStorage<Transaction>,
    public readonly sessionService: WalletSessionService,
    private readonly backgroundUIService: IBackgroundUIService,
    private store: KeyValueStorage<INFTWorkerStore>,
  ) {
    /** udpdate on a regular refresh interval */
    void this.scheduleService.registerImplementation({
      id: TASK_ID,
      callback: this.updateNfts.bind(this),
    })

    /** interval while the ui is open */
    this.backgroundUIService.emitter.on(Opened, this.onOpened.bind(this))

    /** update when the wallet unlocks */
    this.sessionService.emitter.on(Locked, this.onLocked.bind(this))

    /** update when the account changes */
    this.walletStore.subscribe("selected", this.updateNfts.bind(this))

    /** update when a transaction succeeds (could be nft-related) */
    this.transactionsStore.subscribe((_, changeSet) => {
      if (!changeSet?.newValue) {
        return
      }
      const hasSuccessTx = transactionSucceeded(
        changeSet.newValue,
        changeSet?.oldValue,
      )
      if (hasSuccessTx) {
        setTimeout(() => void this.updateNfts(), 5000) // Add a delay so the backend has time to index the nft
      }
    })
  }

  async getStateForCurrentAccount() {
    const account = await this.walletSingleton.getSelectedAccount()
    if (!account) {
      return
    }
    const accountIdentifier = getAccountIdentifier(account)
    const entry = await this.store.get(accountIdentifier)
    if (!entry) {
      await this.store.set(accountIdentifier, {
        isUpdating: false,
        lastUpdatedTimestamp: 0,
      })
    }
    return this.store.get(accountIdentifier)
  }

  async onOpened(opened: boolean) {
    if (opened) {
      const stateForCurrentAccount = await this.getStateForCurrentAccount()
      if (!stateForCurrentAccount) {
        return
      }
      const currentTimestamp = Date.now()
      const differenceInMilliseconds =
        currentTimestamp - stateForCurrentAccount.lastUpdatedTimestamp
      const differenceInMinutes = differenceInMilliseconds / (1000 * 60) // Convert milliseconds to minutes

      // If we haven't done a nft update for the current account in the past 5 minutes, do one on the spot when opening the extension
      if (differenceInMinutes > REFRESH_PERIOD_MINUTES) {
        void this.updateNfts()
      }

      void this.scheduleService.every(RefreshInterval.SLOW, {
        id: TASK_ID,
      })
    } else {
      void this.scheduleService.delete({
        id: TASK_ID,
      })
    }
  }

  onLocked(locked: boolean) {
    if (!locked) {
      void this.updateNfts()
    }
  }

  async updateNfts() {
    const stateForCurrentAccount = await this.getStateForCurrentAccount()

    if (!stateForCurrentAccount) {
      return
    }
    if (stateForCurrentAccount.isUpdating) {
      return
    }

    const account = await this.walletSingleton.getSelectedAccount()
    if (!account) {
      return
    }

    const accountIdentifier = getAccountIdentifier(account)
    const lastUpdatedTimestamp = Date.now()
    await this.store.set(accountIdentifier, {
      isUpdating: true,
      lastUpdatedTimestamp,
    })

    try {
      const nfts = await this.nftsService.getAssets(
        "starknet",
        account.networkId,
        addressSchema.parse(account.address),
      )

      await this.nftsService.upsert(
        nfts,
        addressSchema.parse(account.address),
        account.networkId,
      )

      const contractsAddresses = uniq(
        nfts.map((nft) => ({
          contractAddress: nft.contract_address,
          networkId: account.networkId,
        })),
      )

      await this.nftsService.setCollections(
        "starknet",
        account.networkId,
        contractsAddresses,
      )
    } catch (e) {
      console.error(e)
    }

    await this.store.set(accountIdentifier, {
      isUpdating: false,
      lastUpdatedTimestamp,
    })
  }
}
