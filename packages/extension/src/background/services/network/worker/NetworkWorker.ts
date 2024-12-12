import type { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import type { IBackgroundNetworkService } from "../IBackgroundNetworkService"
import { RefreshIntervalInSeconds } from "../../../../shared/config"
import { everyWhenOpen } from "../../worker/schedule/decorators"
import type { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import type { IDebounceService } from "../../../../shared/debounce"
import type {
  SelectedWalletStoreAccount,
  WalletStorageProps,
} from "../../../../shared/wallet/walletStore"
import type { KeyValueStorage } from "../../../../shared/storage"
import {
  declareContracts,
  getPreDeployedAccount,
} from "../../../devnet/declareAccounts"
import type { INetworkService } from "../../../../shared/network/service/INetworkService"
import { loadContracts } from "../../../wallet/loadContracts"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TASK_ID = "NetworkWorker.updateStatuses"

export class NetworkWorker {
  constructor(
    private readonly networkService: INetworkService,
    private readonly backgroundNetworkService: IBackgroundNetworkService,
    private readonly backgroundUIService: IBackgroundUIService,
    private walletStore: KeyValueStorage<WalletStorageProps>,
    private readonly scheduleService: IScheduleService<typeof TASK_ID>,
    private readonly debounceService: IDebounceService<typeof TASK_ID>,
  ) {
    this.walletStore.subscribe(
      "selected",
      this.onSelectedAccountChange.bind(this),
    )
  }

  updateNetworkStatuses = everyWhenOpen(
    this.backgroundUIService,
    this.scheduleService,
    this.debounceService,
    RefreshIntervalInSeconds.MEDIUM,
    "NetworkWorker.updateNetworkStatuses",
  )(async (): Promise<void> => {
    await this.backgroundNetworkService.updateStatuses()
  })

  private async onSelectedAccountChange(val?: SelectedWalletStoreAccount) {

    if (!val) {
      return
    }

    if (val.networkId === "localhost") {
      const network = await this.networkService.getById(val.networkId)
      const deployerAccount = await getPreDeployedAccount(network)
      if (deployerAccount) {
        const accountClassHash = await declareContracts(
          network,
          deployerAccount,
          loadContracts,
        )

        // Should we keep for dev?
        console.log("Declared account class hash", accountClassHash)
      }
    }
  }
}
