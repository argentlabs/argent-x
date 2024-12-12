import { addressSchema, isArgentNetworkId } from "@argent/x-shared"
import { uniq } from "lodash-es"

import type { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import type { Wallet } from "../../../wallet"
import type { WalletSessionService } from "../../../wallet/session/WalletSessionService"
import { RefreshIntervalInSeconds } from "../../../../shared/config"
import type { INFTService } from "../../../../shared/nft/INFTService"
import type { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import type { WalletStorageProps } from "../../../../shared/wallet/walletStore"
import type { KeyValueStorage } from "../../../../shared/storage"
import { everyWhenOpen } from "../../worker/schedule/decorators"
import { pipe } from "../../worker/schedule/pipe"
import type { IDebounceService } from "../../../../shared/debounce"
import { Recovered } from "../../../wallet/recovery/IWalletRecoveryService"
import type { WalletRecoverySharedService } from "../../../wallet/recovery/WalletRecoverySharedService"
import type { IActivityService } from "../../activity/IActivityService"
import { NftActivity } from "../../activity/IActivityService"

export class NftsWorker {
  constructor(
    private readonly nftsService: INFTService,
    private readonly scheduleService: IScheduleService,
    private readonly walletSingleton: Wallet,
    private walletStore: KeyValueStorage<WalletStorageProps>,
    private readonly activityService: IActivityService,
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

    this.activityService.emitter.on(NftActivity, () => {
      setTimeout(
        () => void this.updateNftsCallback(),
        RefreshIntervalInSeconds.FAST * 1000,
      ) // Add a delay so the backend has time to index the nft
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
      const accountAddress = addressSchema.parse(account.address)

      const nfts = await this.nftsService.getAssets(
        "starknet",
        account.networkId,
        accountAddress,
      )

      await this.nftsService.upsert(nfts, accountAddress, account.networkId)

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
        accountAddress,
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
      RefreshIntervalInSeconds.MEDIUM,
      "NftsWorker.updateNfts",
    ),
  )(async () => {
    await this.updateNftsCallback()
  })
}
