import { addressSchema } from "@argent/shared"
import { uniq } from "lodash-es"

import { IBackgroundUIService } from "../../ui/interface"
import { Wallet } from "../../../../wallet"
import { WalletSessionService } from "../../../../wallet/session/session.service"
import { RefreshInterval } from "../../../../../shared/config"
import { INFTService } from "../../../../../shared/nft/interface"
import { IScheduleService } from "../../../../../shared/schedule/interface"
import { WalletStorageProps } from "../../../../../shared/wallet/walletStore"
import { ArrayStorage, KeyValueStorage } from "../../../../../shared/storage"
import { Transaction } from "../../../../../shared/transactions"
import { hasSuccessfulTransaction } from "../../../../../shared/utils/transactionSucceeded"
import { everyWhenOpen } from "../../worker/schedule/decorators"
import { pipe } from "../../worker/schedule/pipe"
import { IDebounceService } from "../../../../../shared/debounce"
import { Recovered } from "../../../../wallet/recovery/interface"
import { WalletRecoverySharedService } from "../../../../wallet/recovery/shared.service"

export class NftsWorker {
  constructor(
    private readonly nftsService: INFTService,
    private readonly scheduleService: IScheduleService,
    private readonly walletSingleton: Wallet,
    private walletStore: KeyValueStorage<WalletStorageProps>,
    private readonly transactionsStore: ArrayStorage<Transaction>,
    public readonly sessionService: WalletSessionService,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly debounceService: IDebounceService,
    private readonly recoverySharedService: WalletRecoverySharedService,
  ) {
    /** update when the account changes */
    this.walletStore.subscribe("selected", this.updateNftsCallback.bind(this))

    // Listen for recovery event
    this.recoverySharedService.emitter.on(
      Recovered,
      this.updateNftsCallback.bind(this),
    )

    /** update when a transaction succeeds (could be nft-related) */
    this.transactionsStore.subscribe((_, changeSet) => {
      if (!changeSet?.newValue) {
        return
      }
      const hasSuccessTx = hasSuccessfulTransaction(
        changeSet.newValue,
        changeSet?.oldValue,
      )
      if (hasSuccessTx) {
        setTimeout(() => void this.updateNftsCallback(), 5000) // Add a delay so the backend has time to index the nft
      }
    })
  }

  updateNftsCallback = async () => {
    const account = await this.walletSingleton.getSelectedAccount()
    if (!account) {
      return
    }

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
  }

  updateNfts = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshInterval.SLOW,
      "NftsWorker.updateNfts",
    ),
  )(async () => {
    await this.updateNftsCallback()
  })
}
