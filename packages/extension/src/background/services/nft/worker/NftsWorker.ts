import { addressSchema, isArgentNetworkId } from "@argent/x-shared"
import { uniq } from "lodash-es"

import { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import { Wallet } from "../../../wallet"
import { WalletSessionService } from "../../../wallet/session/WalletSessionService"
import { RefreshIntervalInSeconds } from "../../../../shared/config"
import { INFTService } from "../../../../shared/nft/INFTService"
import { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import { WalletStorageProps } from "../../../../shared/wallet/walletStore"
import { ArrayStorage, KeyValueStorage } from "../../../../shared/storage"
import { Transaction } from "../../../../shared/transactions"
import { hasSuccessfulTransaction } from "../../../../shared/utils/transactionSucceeded"
import { everyWhenOpen } from "../../worker/schedule/decorators"
import { pipe } from "../../worker/schedule/pipe"
import { IDebounceService } from "../../../../shared/debounce"
import { Recovered } from "../../../wallet/recovery/IWalletRecoveryService"
import { WalletRecoverySharedService } from "../../../wallet/recovery/WalletRecoverySharedService"

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
        setTimeout(
          () => void this.updateNftsCallback(),
          RefreshIntervalInSeconds.FAST * 1000,
        ) // Add a delay so the backend has time to index the nft
      }
    })
  }

  updateNftsCallback = async () => {
    const account = await this.walletSingleton.getSelectedAccount()
    if (!account) {
      return
    }
    if (!isArgentNetworkId(account.networkId)) {
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
        addressSchema.parse(account.address),
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
      RefreshIntervalInSeconds.SLOW,
      "NftsWorker.updateNfts",
    ),
  )(async () => {
    await this.updateNftsCallback()
  })
}
