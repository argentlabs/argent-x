import { nftService } from "../../../../../shared/nft"
import { debounceService } from "../../../../../shared/debounce"
import { chromeScheduleService } from "../../../../../shared/schedule"
import { old_walletStore } from "../../../../../shared/wallet/walletStore"
import { transactionsStore } from "../../../../../shared/transactions/store"
import {
  recoverySharedService,
  sessionService,
  walletSingleton,
} from "../../../../walletSingleton"
import { backgroundUIService } from "../../ui"
import { NftsWorker } from "./implementation"

export const nftsWorker = new NftsWorker(
  nftService,
  chromeScheduleService,
  walletSingleton,
  old_walletStore,
  transactionsStore,
  sessionService,
  backgroundUIService,
  debounceService,
  recoverySharedService,
)
