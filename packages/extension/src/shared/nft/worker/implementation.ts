import { addressSchema } from "@argent/shared"
import { uniq } from "lodash-es"

import {
  IBackgroundUIService,
  Opened,
} from "../../../background/__new/services/ui/interface"
import { Wallet } from "../../../background/wallet"
import { Locked } from "../../../background/wallet/session/interface"
import { WalletSessionService } from "../../../background/wallet/session/session.service"
import type { WalletStorageProps } from "../../../shared/wallet/walletStore"
import { INFTService } from "../../../ui/services/nfts/interface"
import { IScheduleService } from "../../schedule/interface"
import { ArrayStorage, KeyValueStorage } from "../../storage"
import { Transaction } from "../../transactions"
import { transactionSucceeded } from "../../utils/transactionSucceeded"
import { RefreshInterval } from "../../config"

const TASK_ID = "NftsWorker.updateNfts"
const REFRESH_PERIOD_MINUTES = Math.floor(RefreshInterval.SLOW / 60)

export class NftsWorker {
  private isUpdating = false
  private lastUpdatedTimestamp = 0

  constructor(
    private readonly nftsService: INFTService,
    private readonly scheduleService: IScheduleService<typeof TASK_ID>,
    private readonly walletSingleton: Wallet,
    private walletStore: KeyValueStorage<WalletStorageProps>,
    private readonly transactionsStore: ArrayStorage<Transaction>,
    public readonly sessionService: WalletSessionService,
    private readonly backgroundUIService: IBackgroundUIService,
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

  onOpened(opened: boolean) {
    if (opened) {
      const currentTimestamp = Date.now()
      const differenceInMilliseconds =
        currentTimestamp - this.lastUpdatedTimestamp
      const differenceInMinutes = differenceInMilliseconds / (1000 * 60) // Convert milliseconds to minutes

      // If we haven't done a nft update in the past 5 minutes, do one on the spot when opening the extension
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

  async updateNfts(): Promise<void> {
    if (this.isUpdating) {
      return
    }

    const account = await this.walletSingleton.getSelectedAccount()
    if (!account) {
      return
    }

    this.isUpdating = true
    this.lastUpdatedTimestamp = Date.now()

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

    this.isUpdating = false
  }
}
